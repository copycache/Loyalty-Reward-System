<?php
namespace App\Globals;

use App\Models\Tbl_welcome_bonus_commissions;
use DB;
use Request;
use Carbon\Carbon;
use Validator;
use App\Models\Tbl_membership;
use App\Models\Tbl_membership_income;
use App\Models\Tbl_mlm_plan;
use App\Models\Tbl_membership_indirect_level;
use App\Models\Tbl_membership_unilevel_level;
use App\Models\Tbl_mlm_unilevel_settings;
use App\Models\Tbl_binary_pairing;
use App\Models\Tbl_binary_settings;
use App\Models\Tbl_binary_points_settings;
use App\Globals\Get_plan;
use App\Globals\Audit_trail;
use App\Models\Tbl_membership_mentors_level;
use App\Models\Tbl_membership_gc_income;
use App\Models\Tbl_direct_bonus;
use App\Models\Tbl_indirect_settings;
use App\Models\Tbl_wallet_log;
class Update_plan
{
	
	public static function DIRECT($plan,$label,$data)
	{
		$data = json_decode($data,true);
		$user      = Request::user()->id;
		$action    = "Update Direct";
		$old_value = Get_plan::DIRECT();
		if($data != null)
		{
			// dd($data["manage_direct_bonus"]);
			foreach ($data["manage_direct_bonus"] as $key => $value) 
			{
				$rules["hierarchy"] = "required|numeric|min:1|max:100";
		
				$validator = Validator::make($value, $rules);
		
				if ($validator->fails()) 
				{
					$return["status"]         = "error"; 
					$return["status_code"]    = 400; 
					$return["status_message"] = "Not Number";
		
					return $return;
				}
				else
				{
					$param["hierarchy"] 		              = $value["hierarchy"];
					$param["direct_bonus_checkpoint"]         = $value["direct_bonus_checkpoint"];
					$param["direct_bonus_amount"]             = $value["direct_bonus_amount"];
					if ($value["direct_bonus_id"]) 
					{
						$param["archive"] = $value["archive"];
						Tbl_direct_bonus::where("direct_bonus_id", $value["direct_bonus_id"])->update($param);
					}
					else
					{
						if($param["direct_bonus_checkpoint"] != 0 && $param["direct_bonus_amount"] !=0)
						{
							Tbl_direct_bonus::insert($param);
						}
					}
				}
			}
			foreach($data["direct_settings"] as $key => $value)
			{
				foreach($value as $key2 => $value2)
				{
					$check = Tbl_membership_income::where("membership_id",$key)->where("membership_entry_id",$key2)->first();
					if($check)
					{
						$update["membership_direct_income"] = $value2;
						Tbl_membership_income::where("membership_id",$key)->where("membership_entry_id",$key2)->update($update);
					}
					else
					{
						$insert["membership_id"]			= $key;
						$insert["membership_entry_id"]      = $key2;
						$insert["membership_direct_income"] = $value2;
						Tbl_membership_income::insert($insert);
					}
				}
			}
			foreach($data["direct_settings2"] as $key => $value)
			{
				foreach($value as $key2 => $value2)
				{
					$check = Tbl_membership_gc_income::where("membership_id",$key)->where("membership_entry_id",$key2)->first();
					if($check)
					{
						$update2["membership_gc_income"] = $value2;
						Tbl_membership_gc_income::where("membership_id",$key)->where("membership_entry_id",$key2)->update($update2);
					}
					else
					{
						$insert2["membership_id"]			= $key;
						$insert2["membership_entry_id"]      = $key2;
						$insert2["membership_gc_income"] = $value2;
						Tbl_membership_gc_income::insert($insert2);
					}
				}
			}
		}

		Plan::update_label($plan,$label);
		$update_plan["mlm_plan_enable"] = 1;
		Tbl_mlm_plan::where("mlm_plan_code",$plan)->update($update_plan);

		$new_value = Get_plan::DIRECT();
		Audit_trail::audit(serialize($old_value),serialize($new_value),$user,$action);

		$return["direct"]         = "ok";
		$return["status"]         = "success";
		$return["update_status"]  = $update_plan["mlm_plan_enable"];
		$return["status_code"]    = 201;
		$return["status_message"] = "Settings updated...";

		return $return;
	}

	public static function INDIRECT($plan,$label,$data)
	{

		$data = json_decode($data,true);
		$user      = Request::user()->id;
		$action    = "Update Indirect";
		$old_value = Get_plan::INDIRECT();
		$times = 0;
		if($data != null)
		{
			Tbl_membership_indirect_level::truncate();
			foreach($data["membership_settings"] as $key => $value)
			{
				$value["membership_indirect_level"] = $value["membership_indirect_level"] + 1;
				if(isset($data["indirect_settings"][$value["membership_id"]]))
				{
					/* GET THE DATA SETTINGS PER MEMBERSHIP */
					foreach($data["indirect_settings"][$value["membership_id"]] as $membership_entry_id => $per_membership)
					{
						$level = 2;
						/* GET THE DATA SETTINGS PER LEVEL OF TARGET MEMBERSHIP */
						foreach($per_membership as $level_target => $membership_indirect_income)
						{
							/* membership_entry_id  = membership_entry_id */
							/* membership_indirect_income = membership_indirect_income*/
							$check = Tbl_membership_indirect_level::where("membership_level",$level)->where("membership_id",$value["membership_id"])->where("membership_entry_id",$membership_entry_id)->first();
							if($check)
							{
								$update_level["membership_level"]		    = $level;
								$update_level["membership_id"]		        = $value["membership_id"];
								$update_level["membership_entry_id"]	    = $membership_entry_id;
								$update_level["membership_indirect_income"] = $membership_indirect_income;
								Tbl_membership_indirect_level::where("membership_level",$level)->where("membership_id",$value["membership_id"])->where("membership_entry_id",$membership_entry_id)->update($update_level);
							}
							else
							{
								$insert["membership_level"]		      = $level;
								$insert["membership_id"]		      = $value["membership_id"];
								$insert["membership_entry_id"]	      = $membership_entry_id;
								$insert["membership_indirect_income"] = $membership_indirect_income;
								Tbl_membership_indirect_level::insert($insert);
							}

							$level++;
							if($level > $value["membership_indirect_level"])
							{
								Tbl_membership_indirect_level::where("membership_level",">=",$level)->where("membership_id",$value["membership_id"])->delete();
								break;
							}
						}

					}
				}

				$update["membership_indirect_level"] = count(Tbl_membership_indirect_level::select("membership_level")->where("membership_id",$value["membership_id"])->groupBy("membership_level")->get());
				Tbl_membership::where("membership_id",$value["membership_id"])->update($update);
			}
		}

		Plan::update_label($plan,$label);
		$update_plan["mlm_plan_enable"] = 1;
		Tbl_mlm_plan::where("mlm_plan_code",$plan)->update($update_plan);

		$new_value = Get_plan::INDIRECT();
		Audit_trail::audit(serialize($old_value),serialize($new_value),$user,$action);

		$return["status"]         = "success";
		$return["update_status"]  = $update_plan["mlm_plan_enable"];
		$return["status_code"]    = 201;
		$return["status_message"] = "Settings updated...";

		return $return;
	}

	public static function UNILEVEL($plan,$label,$data)
	{
		$data = json_decode($data,true);
		$user      = Request::user()->id;
		$action    = "Update Unilevel";
		$old_value = Get_plan::UNILEVEL();
		if($data != null)
		{

			foreach($data["membership_settings"] as $key => $value)
			{
				if(isset($data["unilevel_settings"][$value["membership_id"]]))
				{
					/* GET THE DATA SETTINGS PER MEMBERSHIP */
					foreach($data["unilevel_settings"][$value["membership_id"]] as $membership_id => $per_membership)
					{
						$level = 1;
						/* GET THE DATA SETTINGS PER LEVEL OF TARGET MEMBERSHIP */
						foreach($per_membership as $membership_percentage)
						{
							/* membership_entry_id  = membership_entry_id */
							/* membership_percentage = membership_percentage*/
							$check = Tbl_membership_unilevel_level::where("membership_level",$level)->where("membership_id",$value["membership_id"])->where("membership_entry_id",$membership_id)->first();
							if($check)
							{
								$update_level["membership_level"]		    = $level;
								$update_level["membership_id"]		        = $value["membership_id"];
								$update_level["membership_entry_id"]	    = $membership_id;
								$update_level["membership_percentage"] 		= $membership_percentage;
								Tbl_membership_unilevel_level::where("membership_level",$level)->where("membership_id",$value["membership_id"])->where("membership_entry_id", $membership_id)->update($update_level);
							}
							else
							{
								$insert["membership_level"]		      = $level;
								$insert["membership_id"]		      = $value["membership_id"];
								$insert["membership_entry_id"]	      = $membership_id;
								$insert["membership_percentage"]      = $membership_percentage;
								Tbl_membership_unilevel_level::insert($insert);
							}

							$level++;
							if($level > $value["membership_unilevel_level"])
							{
								Tbl_membership_unilevel_level::where("membership_level",">=",$level)->where("membership_id",$value["membership_id"])->where("membership_entry_id", $membership_id)->delete();
							}
						}

					}
				}
				$update["membership_unilevel_level"] = $value['membership_unilevel_level'];
				// count(Tbl_membership_unilevel_level::select("membership_level")->where("membership_id",$value["membership_id"])->groupBy("membership_level")->get());

				$update["membership_required_pv"]    = $value["membership_required_pv"];
				Tbl_membership::where("membership_id",$value["membership_id"])->update($update);
			}
		}

		Plan::update_label($plan,$label);
		$update_plan["mlm_plan_enable"] = 1;
		Tbl_mlm_plan::where("mlm_plan_code",$plan)->update($update_plan);
		$update_unilevel_settings["personal_as_group"]  	   = $data["setup"]["personal_as_group"];
		$update_unilevel_settings["gpv_to_wallet_conversion"]  = $data["setup"]["gpv_to_wallet_conversion"];
		$update_unilevel_settings["auto_ship"]  			   = $data["setup"]["auto_ship"];
		$update_unilevel_settings["is_dynamic"]  			   = $data["setup"]["is_dynamic"];
		$update_unilevel_settings["unilevel_complan_show_to"]  			   = $data["setup"]["unilevel_complan_show_to"];
		Plan::update_label("PERSONAL_PV",$data["setup"]["personal_pv"]);
		Plan::update_label("GROUP_PV",$data["setup"]["group_pv"]);

		Tbl_mlm_unilevel_settings::where("mlm_unilevel_settings_id",1)->update($update_unilevel_settings);

		$new_value = Get_plan::UNILEVEL();
		Audit_trail::audit(serialize($old_value),serialize($new_value),$user,$action);

		$return["status"]         = "success";
		$return["update_status"]  = $update_plan["mlm_plan_enable"];
		$return["status_code"]    = 201;
		$return["status_message"] = "Settings updated...";
		return $return;
	}

	public static function BINARY($plan,$label,$data)
	{
		$data = json_decode($data,true);
		// dd($data);
		$user      = Request::user()->id;
		$action    = "Update Binary";
		$old_value = Get_plan::BINARY();
		if($data != null)
		{

			$combined_id = array();
			foreach($data["binary_settings_pair"] as $index => $value)
			{
				if($value["binary_pairing_bonus"] != "" && $value["binary_pairing_bonus"] != 0)
				{
					$left       = $value["binary_pairing_left"]  ? $value["binary_pairing_left"]  : 0;
					$right      = $value["binary_pairing_right"] ? $value["binary_pairing_right"] : 0;
					$membership = $value["binary_pairing_membership"] ? $value["binary_pairing_membership"] : null;
					$check      = Tbl_binary_pairing::where("binary_pairing_left",$left)->where("binary_pairing_right",$right)->where("binary_pairing_membership", $membership)->first();
					if(!$check)
					{
						$insert["binary_pairing_left"]	      = $left;
						$insert["binary_pairing_right"]		  = $right;
						$insert["binary_pairing_bonus"]		  = $value["binary_pairing_bonus"] ? $value["binary_pairing_bonus"] : 0;
						$insert["binary_pairing_membership"]  = $value["binary_pairing_membership"] ? $value["binary_pairing_membership"] : 0;
						$insert["binary_pairing_membership"]  = $insert["binary_pairing_membership"] == 0 ? null : $insert["binary_pairing_membership"];
						$id 								  = Tbl_binary_pairing::insertGetId($insert);
						array_push($combined_id,$id);
					}
					else
					{
						$update["binary_pairing_bonus"]       = $value["binary_pairing_bonus"] ? $value["binary_pairing_bonus"] : 0;
						$update["archive"]				      = 0;

						Tbl_binary_pairing::where("binary_pairing_left",$left)->where("binary_pairing_membership", $membership)->where("binary_pairing_right",$right)->update($update);
						array_push($combined_id,$check->binary_pairing_id);
					}
				}
			}
			if($data["binary_settings_pair_end"]["binary_pairing_bonus"] != "" && $data["binary_settings_pair_end"]["binary_pairing_bonus"] != 0)
			{
				$left       = $data["binary_settings_pair_end"]["binary_pairing_left"]  ? $data["binary_settings_pair_end"]["binary_pairing_left"]  : 0;
				$right      = $data["binary_settings_pair_end"]["binary_pairing_right"] ? $data["binary_settings_pair_end"]["binary_pairing_right"] : 0;
				$membership = $data["binary_settings_pair_end"]["binary_pairing_membership"] ? $data["binary_settings_pair_end"]["binary_pairing_membership"] : null;
				
				$check = Tbl_binary_pairing::where("binary_pairing_left",$left)->where("binary_pairing_right",$right)->where("binary_pairing_membership", $membership)->first();
				if(!$check)
				{
					$insert["binary_pairing_left"]	     = $left;
					$insert["binary_pairing_right"]		 = $right;
					$insert["binary_pairing_bonus"]		 = $data["binary_settings_pair_end"]["binary_pairing_bonus"] ? $data["binary_settings_pair_end"]["binary_pairing_bonus"] : 0;
					$insert["binary_pairing_membership"] = $data["binary_settings_pair_end"]["binary_pairing_membership"] ? $data["binary_settings_pair_end"]["binary_pairing_membership"] : 0;
					$insert["binary_pairing_membership"] = $insert["binary_pairing_membership"] == 0 ? null : $insert["binary_pairing_membership"];

					$id 								 = Tbl_binary_pairing::insertGetId($insert);
					array_push($combined_id,$id);
				}
				else
				{
					$update["binary_pairing_bonus"]       = $data["binary_settings_pair_end"]["binary_pairing_bonus"] ? $data["binary_settings_pair_end"]["binary_pairing_bonus"] : 0;
					$update["archive"]				      = 0;

					Tbl_binary_pairing::where("binary_pairing_left",$left)->where("binary_pairing_membership", $membership)->where("binary_pairing_right",$right)->update($update);
					array_push($combined_id,$check->binary_pairing_id);
				}
			}

			$update_archive["archive"] = 1;
			Tbl_binary_pairing::whereNotIn("binary_pairing_id",$combined_id)->update($update_archive);


			foreach($data["binary_settings"] as $key => $value)
			{
				foreach($value as $key2 => $value2)
				{
					$check = Tbl_binary_points_settings::where("membership_id",$key)->where("membership_entry_id",$key2)->first();
					if($check)
					{
						$update_pts["membership_binary_points"] = $value2;
						Tbl_binary_points_settings::where("membership_id",$key)->where("membership_entry_id",$key2)->update($update_pts);
					}
					else
					{
						$insert_pts["membership_id"]			= $key;
						$insert_pts["membership_entry_id"]      = $key2;
						$insert_pts["membership_binary_points"] = $value2;
						Tbl_binary_points_settings::insert($insert_pts);
					}
				}
			}
			foreach($data["binary_slot_limit_settings"] as $key => $slot_limit)
			{
				foreach($slot_limit as $key2 => $limit)
				{
					$check = Tbl_binary_points_settings::where("membership_id",$key)->where("membership_entry_id",$key2)->first();
					if($check)
					{
						$update_slot_limit["max_slot_per_level"] = $limit;
						Tbl_binary_points_settings::where("membership_id",$key)->where("membership_entry_id",$key2)->update($update_slot_limit);
					}
					else
					{
						$insert_slot_limit["membership_id"] = $key;
						$insert_slot_limit["membership_entry_id"] = $key2;
						$insert_slot_limit["max_slot_per_level"] = $limit;
						Tbl_binary_points_settings::insert($insert_slot_limit);
					}
				}
			}

			$level_mentors = array();
			foreach($data["membership_settings"] as $key => $value)
			{
				$update_set["membership_pairings_per_day"] = $value["membership_pairings_per_day"];
				$update_set["max_earnings_per_cycle"] = $value["max_earnings_per_cycle"];
				$update_set["mentors_level"] 			   = $value["mentors_level"];
				$update_set["can_receive_points"] 		   = $value["can_receive_points"];
				$update_set["binary_placement_enable"] 	   = $value["binary_placement_enable"];
				$update_set["flushout_enable"] 	   		   = $value["flushout_enable"];
				$update_set["membership_pairings_per_day"] = $value["membership_pairings_per_day"];
				$update_set["max_points_per_level"] = $value["max_points_per_level"];
				$update_set["max_earnings_per_level"] = $value["max_earnings_per_level"];
				$update_set["binary_required_direct"] = $value["binary_required_direct"];
				$update_set["binary_realtime_commission"] = $value["binary_realtime_commission"];
				$update_set["binary_waiting_commission_reset_days"] = $value["binary_waiting_commission_reset_days"];

				Tbl_membership::where("membership_id",$value["membership_id"])->update($update_set);

				$level_mentors[$value["membership_id"]] = $value["mentors_level"];
			}

			foreach($data["mentors_settings"] as $key => $value)
			{
				$level = 1;
				if($value)
				{
					foreach($value as $key2 => $value2)
					{
						if($key2 != 0)
						{
							$check = $check = Tbl_membership_mentors_level::where("membership_id",$key)->where("membership_level",$key2)->first();
							if($check)
							{
								$update_pts_mentor["mentors_bonus"]     = $value2["mentors_bonus"];
								$update_pts_mentor["mentors_direct"]    = $value2["mentors_direct"];
								Tbl_membership_mentors_level::where("membership_id",$key)->where("membership_level",$key2)->update($update_pts_mentor);
							}
							else
							{
								$insert_pts_mentor["membership_level"]	= $key2;
								$insert_pts_mentor["membership_id"]		= $key;
								$insert_pts_mentor["mentors_bonus"]     = $value2["mentors_bonus"];
								$insert_pts_mentor["mentors_direct"]    = $value2["mentors_direct"];
								Tbl_membership_mentors_level::insert($insert_pts_mentor);
							}

							$level++;
							if(isset($level_mentors[$key])) {
								if($level > $level_mentors[$key])
								{
									Tbl_membership_mentors_level::where("membership_level",">=",$level)->where("membership_id",$key)->delete();
									break;
								}
							} else {
								Tbl_membership_mentors_level::where("membership_id",$key)->delete();
								break;
							}
						}
					}
				}
			}
			$membership_binary_level = Tbl_membership::where("archive",0)->select('membership_id')->get();
			foreach ($membership_binary_level as $key => $value)
			{
				$update_membership_binary_level['membership_binary_level'] =  $data["membership_level"][$value["membership_id"]] ? $data["membership_level"][$value["membership_id"]] :0;
				Tbl_membership::where("membership_id",$value["membership_id"])->update($update_membership_binary_level);
			}
			
			if(isset($data['binary_projected_income_label']))
			{
				Plan::update_label("BINARY_PROJECTED_INCOME",$data['binary_projected_income_label']);
			}

			if(isset($data['mentors_bonus_label']))
			{
				Plan::update_label("MENTORS_BONUS",$data['mentors_bonus_label']);
			}
		}


		$update_plan["mlm_plan_enable"] = 1;
		Tbl_mlm_plan::where("mlm_plan_code",$plan)->update($update_plan);

		Plan::update_label($plan,$label);
		Plan::update_label("BINARY_POINTS_LEFT",$data["setup"]["binary_points_left"]);
		Plan::update_label("BINARY_POINTS_RIGHT",$data["setup"]["binary_points_right"]);
		$update_binary_settings["strong_leg_retention"]  	  = $data["setup"]["strong_leg_retention"];
		$update_binary_settings["gc_pairing_count"]           = $data["setup"]["gc_pairing_count"];
		$update_binary_settings["cycle_per_day"]  			  = $data["setup"]["cycle_per_day"];
		$update_binary_settings["binary_limit_type"]  		  = $data["setup"]["binary_limit_type"];
		$update_binary_settings["gc_paring_amount"]  		  = $data["setup"]["gc_paring_amount"] == "" ? 0 : $data["setup"]["gc_paring_amount"];
		$update_binary_settings["amount_binary_limit"]  	  = $data["setup"]["amount_binary_limit"] == "" ? 0 : $data["setup"]["amount_binary_limit"];
		$update_binary_settings["strong_leg_limit_points"]	  = $data["setup"]["strong_leg_limit_points"];
		$update_binary_settings["crossline"]  			      = (int)$data["setup"]["crossline"];
		$update_binary_settings["included_binary_repurchase"] = $data["setup"]["included_binary_repurchase"];
		$update_binary_settings["mentors_matching_cycle"]	  = $data["setup"]["mentors_matching_cycle"];
		$update_binary_settings["mentors_matching_limit"]	  = $data["setup"]["mentors_matching_limit"];
		$update_binary_settings["binary_points_enable"]	      = $data["setup"]["binary_points_enable"];
		$update_binary_settings["binary_points_minimum_conversion"]	  = $data["setup"]["binary_points_minimum_conversion"];
		$update_binary_settings["mentors_points_enable"]	      = $data["setup"]["mentors_points_enable"];
		$update_binary_settings["mentors_points_minimum_conversion"]	  = $data["setup"]["mentors_points_minimum_conversion"];
		$update_binary_settings["binary_extreme_position"]	  = $data["setup"]["binary_extreme_position"];
		$update_binary_settings["binary_maximum_slot_per_level_enable"]	  = $data["setup"]["binary_maximum_slot_per_level_enable"];
		$update_binary_settings["binary_maximum_points_per_level_enable"]	  = $data["setup"]["binary_maximum_points_per_level_enable"];
		$update_binary_settings["show_slot_tracker"]	  = $data["setup"]["binary_maximum_slot_per_level_enable"] ? $data["setup"]["show_slot_tracker"] : 0;
		$update_binary_settings["show_earnings_tracker"]	  = $data["setup"]["binary_maximum_points_per_level_enable"] ? $data["setup"]["show_earnings_tracker"] : 0;
		$update_binary_settings["show_earnings_tracker_per_cycle"]	  = $data["setup"]["show_earnings_tracker_per_cycle"];
		$update_binary_settings["binary_required_direct_enable"]	  = $data["setup"]["binary_required_direct_enable"];
		$update_binary_settings["minimum_membership_for_realtime_commission"]	  = $data["setup"]["minimum_membership_for_realtime_commission"];
		$update_binary_settings["binary_auto_placement_based_on_direct"] = $data["setup"]["binary_auto_placement_based_on_direct"];
		$update_binary_settings["binary_number_of_direct_for_auto_placement"] = $data["setup"]["binary_number_of_direct_for_auto_placement"];
		$update_binary_settings["binary_priority_leg_position"] = $data["setup"]["binary_priority_leg_position"];
		$update_binary_settings["binary_default_position_without_spill"] = $data["setup"]["binary_default_position_without_spill"];

		Tbl_binary_settings::where("binary_settings_id",1)->update($update_binary_settings);

		$new_value = Get_plan::BINARY();
		Audit_trail::audit(serialize($old_value),serialize($new_value),$user,$action);

		$return["status"]         = "success";
		$return["update_status"]  = $update_plan["mlm_plan_enable"];
		$return["status_code"]    = 201;
		$return["status_message"] = "Settings updated...";

		return $return;
	}

    public static function BINARY_REPURCHASE($plan,$label,$data)
	{
		$data = json_decode($data,true);
		$user      = Request::user()->id;
		$action    = "Update Binary Repurchase";
		$old_value = Get_plan::BINARY_REPURCHASE();

		// if($data != null)
		// {

		// }

		Plan::update_label($plan,$label);
		$update_plan["mlm_plan_enable"] = 1;
		Tbl_mlm_plan::where("mlm_plan_code",$plan)->update($update_plan);

		$new_value = Get_plan::BINARY_REPURCHASE();
		Audit_trail::audit(serialize($old_value),serialize($new_value),$user,$action);
		$return["status"]         = "success";
		$return["update_status"]  = $update_plan["mlm_plan_enable"];
		$return["status_code"]    = 201;
		$return["status_message"] = "Settings updated...";

		return $return;

	}

	public static function DROPSHIPPING_BONUS($plan,$label,$data)
	{
		$data 		= json_decode($data,true);
		$user      	= Request::user()->id;
		$action    	= "Update Dropshipping Bonus";
		$old_value 	= Get_plan::DROPSHIPPING_BONUS();

		Plan::update_label($plan,$label);

		$update_plan["mlm_plan_enable"] = 1;
		Tbl_mlm_plan::where("mlm_plan_code",$plan)->update($update_plan);


		$new_value = Get_plan::DROPSHIPPING_BONUS();
		Audit_trail::audit(serialize($old_value),serialize($new_value),$user,$action);

		Tbl_wallet_log::where('wallet_log_details', $old_value['label'])->update(['wallet_log_details' => $new_value['label']]);

		$return["status"]         = "success";
		$return["update_status"]  = $update_plan["mlm_plan_enable"];
		$return["status_code"]    = 201;
		$return["status_message"] = "Settings updated...";

		return $return;
	}	

	public static function WELCOME_BONUS($plan,$label,$data)
	{
		$data 		= json_decode($data,true);
		$user      	= Request::user()->id;
		$action    	= "Update Welcome Bonus";
		$old_value 	= Get_plan::WELCOME_BONUS();
		Plan::update_label($plan,$label);

		if($data) {
			if($data["commission"]) {
				foreach($data["commission"] as $settings) {
					$update["commission"] = $settings["commission"];
					Tbl_welcome_bonus_commissions::where('membership_id', $settings["membership_id"])->update($update);
				}
			}
		}
		$update_plan["mlm_plan_enable"] = 1;
		Tbl_mlm_plan::where("mlm_plan_code",$plan)->update($update_plan);


		$new_value = Get_plan::WELCOME_BONUS();
		Audit_trail::audit(serialize($old_value),serialize($new_value),$user,$action);

		Tbl_wallet_log::where('wallet_log_details', $old_value['label'])->update(['wallet_log_details' => $new_value['label']]);

		$return["status"]         = "success";
		$return["update_status"]  = $update_plan["mlm_plan_enable"];
		$return["status_code"]    = 201;
		$return["status_message"] = "Settings updated...";

		return $return;
	}
}
