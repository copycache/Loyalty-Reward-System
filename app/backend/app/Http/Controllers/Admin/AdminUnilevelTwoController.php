<?php
namespace App\Http\Controllers\Admin;

use App\Globals\Log;
use App\Globals\Audit_trail;
use App\Globals\Special_plan;
use App\Models\Tbl_mlm_unilevel_settings;
use App\Models\Tbl_unilevel_points;
use App\Models\Tbl_slot;
use App\Models\Tbl_membership;
use App\Models\Tbl_unilevel_distribute;
use App\Models\Tbl_tree_sponsor;
use App\Models\Tbl_unilevel_distribute_full;
use App\Models\Tbl_override_points;
use App\Models\Tbl_membership_unilevel_level;
use App\Models\Tbl_dynamic_compression_record;

use Request;
use Carbon\Carbon;

class AdminUnilevelTwoController extends AdminController
{
	public static $gpv = 0;
	public static $child_level   = null;
	public static $child_counter = null;

	public function distribute_points($slot_id, $start_date, $end_date, $full_id)
	{
		$settings = Tbl_mlm_unilevel_settings::first();

		if ($settings)
		{
			$slot = Tbl_slot::where("slot_id", $slot_id)->first();
			$personal_as_group  = $settings->personal_as_group;
			$gpv_to_wallet_conversion = $settings->gpv_to_wallet_conversion;
			$membership = Tbl_membership::where("membership_id", $slot->slot_membership)->first();

			if ($membership)
			{
				$start_date = Carbon::parse($start_date);
				$end_date   = Carbon::parse($end_date);

				$required_pv  = $membership->membership_required_pv;
				$total_pv     = Tbl_unilevel_points::where("unilevel_points_slot_id", $slot->slot_id)
								->where("unilevel_points_type", "UNILEVEL_PPV")
								->whereBetween("unilevel_points_date_created", [$start_date, $end_date])
								->where("unilevel_points_distribute", 0)
								->sum("unilevel_points_amount");

				// Compute total GPV
				$this->loop($slot_id, $slot_id, $start_date, $end_date);
				$total_gpv = Self::$gpv;

				$total_override = Tbl_override_points::where("slot_id", $slot->slot_id)
									->whereBetween("override_points_date_created", [$start_date, $end_date])
									->where("distributed", 0)
									->sum("override_amount");

				$convert_wallet = 0;
				$status = 0;
				$unilevel_multiplier = 0;
				$override_converted = 0;

				if ($personal_as_group == 1)
				{
					$total_gpv += Tbl_unilevel_points::where("unilevel_points_slot_id", $slot->slot_id)
									->where("unilevel_points_type", "UNILEVEL_PPV")
									->whereBetween("unilevel_points_date_created", [$start_date, $end_date])
									->where("unilevel_points_distribute", 0)
									->sum("unilevel_points_amount");
				}

				$update_log["unilevel_points_distribute"] = 1;
				Tbl_unilevel_points::where("unilevel_points_slot_id", $slot->slot_id)
					->whereIn("unilevel_points_type", ["UNILEVEL_PPV", "UNILEVEL_GPV"])
					->whereBetween("unilevel_points_date_created", [$start_date, $end_date])
					->update($update_log);

				// --------------------------
				// UNILEVEL DISTRIBUTION LOGIC
				// --------------------------
				if ($total_pv >= $required_pv)
				{
					$status = 1;
					if ($total_gpv != 0)
					{
						$income_wallet = $total_gpv * $gpv_to_wallet_conversion;
						if ($income_wallet != 0)
						{
							$convert_wallet = $income_wallet;

							Log::insert_wallet($slot_id, $income_wallet, "UNILEVEL_COMMISSION");
							Log::insert_earnings($slot_id, $income_wallet, "UNILEVEL_COMMISSION", "UNILEVEL DISTRIBUTION", $slot_id, "", 0);
						}
					}
				}

				// --------------------------
				// OVERRIDE COMMISSION LOGIC
				// --------------------------
				if ($total_override != 0)
				{
					$override_converted = $total_override * $settings->gpv_to_wallet_conversion;
					Log::insert_wallet($slot_id, $override_converted, "OVERRIDE_COMMISSION");
					Log::insert_earnings($slot_id, $override_converted, "OVERRIDE_COMMISSION", "UNILEVEL DISTRIBUTION", $slot_id, "", 0);
				}

				$update_override["distributed"] = 1;
				Tbl_override_points::where("slot_id", $slot->slot_id)
					->whereBetween("override_points_date_created", [$start_date, $end_date])
					->where("distributed", 0)
					->update($update_override);

				// --------------------------
				// UNILEVEL DISTRIBUTE RECORD
				// --------------------------
				$insert_distribute = [
					"unilevel_distribute_date_start" => $start_date,
					"unilevel_distribute_end_start"  => $end_date,
					"unilevel_personal_pv"           => $total_pv,
					"unilevel_required_personal_pv"  => $required_pv,
					"unilevel_group_pv"              => round($total_gpv, 2),
					"status"                         => $status,
					"unilevel_amount"                => $convert_wallet,
					"unilevel_multiplier"            => $unilevel_multiplier,
					"unilevel_date_distributed"      => Carbon::now(),
					"distribute_full_id"             => $full_id,
					"slot_id"                        => $slot_id,
				];

				Tbl_unilevel_distribute::insert($insert_distribute);
			}
		}

		$return["status"]         = "success";
		$return["status_code"]    = 201;
		$return["status_message"] = "Slot Distributed";

		return $return;
	}


	public function distribute_slot()
	{
		$slot_id    					 = Request::input("slot_id");
		$start_date 					 = Request::input("start_date");  
		$end_date   				     = Request::input("end_date")." 23:59:59"; 	
		$full_id    					 = Request::input("full_id"); 		

		Self::$child_level[$slot_id]   = 0;
		Self::$child_counter[$slot_id] = 0;

		// $parent_id			= 1;
		// $slot_id			= 1;
		// $start_date			= "10/01/2018";
		// $end_date			= "10/31/2018";

		$response  = $this->distribute_points($slot_id,$start_date,$end_date,$full_id,);

		return response()->json($response, 200);
	}

	public function loop($parent_id,$slot_id,$start_date,$end_date)
	{
		$parent             = Tbl_slot::where("slot_id",$parent_id)->first();
		$child_tree         = Tbl_tree_sponsor::where("sponsor_parent_id",$slot_id)->where("sponsor_level",1)->get();
		$parent_membership  = Tbl_membership::where("membership_id",$parent->slot_membership)->first();
        $start_date         = Carbon::parse($start_date);
        $end_date           = Carbon::parse($end_date);
		$settings           = Tbl_mlm_unilevel_settings::first();
		$personal_as_group  = $settings->personal_as_group;
		
		if($settings && $parent_membership)
		{
			foreach($child_tree as $tree)
			{
				$plus                 = 0;
				$proceed_to_loop      = 1;
				$slot                 = Tbl_slot::where("slot_id",$tree->sponsor_child_id)->first();
				                        // Tbl_slot::where("slot_id",$tree->sponsor_child_id)->update(["slot_personal_spv"=>0]);
				$membership           = Tbl_membership::where("membership_id",$slot->slot_membership)->first();

				if($membership)
				{
					$check = Tbl_membership_unilevel_level::where("membership_id",$parent_membership->membership_id)->where("membership_level",Self::$child_counter[$slot_id] + 1)->where("membership_entry_id",$membership->membership_id)->first();

					if($check)
					{
						$required_pv          = $membership->membership_required_pv;
						$total_pv             = Tbl_unilevel_points::where("unilevel_points_slot_id",$slot->slot_id)->where("unilevel_points_type","UNILEVEL_PPV")->where("unilevel_points_date_created",">=",$start_date)->where("unilevel_points_date_created","<=",$end_date)->where("unilevel_points_distribute",0)->sum("unilevel_points_amount");

						if($total_pv >= $required_pv)
						{
							$cause_level                               = Tbl_tree_sponsor::where("sponsor_parent_id",$parent_id)->where("sponsor_child_id",$slot_id)->first() ? Tbl_tree_sponsor::where("sponsor_parent_id",$parent_id)->where("sponsor_child_id",$slot_id)->first()->sponsor_level : 0;
							$dynamic_record["slot_id"]			       = $parent_id;
							$dynamic_record["earned_points"]	       = $total_pv * ($check->membership_percentage/100);
							$dynamic_record["cause_slot_id"]	       = $slot->slot_id;
							$dynamic_record["dynamic_level"]	       = Self::$child_counter[$slot_id] + 1;
							$dynamic_record["cause_slot_level"]	       = $cause_level;
							$dynamic_record["start_date"]		       = $start_date;
							$dynamic_record["end_date"]			       = $end_date;
							$dynamic_record["date_created"]		       = Carbon::now();
							$dynamic_record["cause_slot_ppv"]	       = $total_pv;
							$dynamic_record["cause_slot_percentage"]   = $check->membership_percentage;
							Tbl_dynamic_compression_record::insert($dynamic_record);


							Self::$gpv = Self::$gpv + ($total_pv * ($check->membership_percentage/100));
							Self::$child_level[$tree->sponsor_child_id]   = Self::$child_counter[$slot_id] + 1;
							$plus = 1;
						}
					}
					else
					{
						$proceed_to_loop = 0;
					}
				}

				if($proceed_to_loop == 1)
				{
					Self::$child_counter[$tree->sponsor_child_id]   = Self::$child_counter[$slot_id] + $plus;
					$this->loop($parent_id,$tree->sponsor_child_id,$start_date,$end_date);
				}

			}
		}
	}

	public function distribute_start()
	{
		$user       = Request::user()->id;
		$action     = "Unilevel Distribute";
		Audit_trail::audit(null,null,$user,$action); 
		$start_date = Request::input("start_date");  
		$end_date   = Request::input("end_date")." 23:59:59"; 	
		$insert["start_date"]		  = $start_date;
		$insert["end_date"]			  = $end_date;
		$insert["distribution_date"]  = Carbon::now();

		$return["status"]             = "success";
		$return["status_code"]        = 201;
		$return["status_message"]     = "Slot Distribution Start";
		$return["distribute_full_id"] = Tbl_unilevel_distribute_full::insertGetId($insert);

		return response()->json($return, 200);
	}
}
