<?php
namespace App\Globals;

use App\Models\Tbl_welcome_bonus_commissions;
use Carbon\Carbon;
use App\Models\Tbl_membership;
use App\Models\Tbl_membership_income;
use App\Models\Tbl_mlm_plan;
use App\Models\Tbl_membership_indirect_level;
use App\Models\Tbl_membership_unilevel_level;
use App\Models\Tbl_mlm_unilevel_settings;
use App\Models\Tbl_binary_pairing;
use App\Models\Tbl_binary_settings;
use App\Models\Tbl_binary_points_settings;
use App\Models\Tbl_membership_mentors_level;
use App\Models\Tbl_membership_gc_income;
use App\Models\Tbl_direct_bonus;
use App\Models\Tbl_indirect_settings;
use App\Models\Tbl_membership_upgrade_settings;


class Get_plan
{

	public static function DIRECT()
	{

		$plan 				   = Tbl_mlm_plan::where("mlm_plan_code","DIRECT")->first();
		$data["label"]         = Plan::get_label($plan->mlm_plan_code);
		$data["status"]        = $plan->mlm_plan_enable;

		$data["settings"]      = [];


		$data["settings"]["direct_settings"] = [];

		$get                   = Tbl_membership::where("archive",0)->get();
		foreach($get as $g)
		{
			foreach($get as $g2)
			{
				$check = Tbl_membership_income::where("membership_id",$g->membership_id)->where("membership_entry_id",$g2->membership_id)->first();
				if($check)
				{
					$data["settings"]["direct_settings"][$g->membership_id][$g2->membership_id] = $check->membership_direct_income;
				}
				else
				{
					$data["settings"]["direct_settings"][$g->membership_id][$g2->membership_id] = 0;
				}
				$check2 = Tbl_membership_gc_income::where("membership_id",$g->membership_id)->where("membership_entry_id",$g2->membership_id)->first();
				if($check2)
				{
					$data["settings"]["direct_settings2"][$g->membership_id][$g2->membership_id] = $check2->membership_gc_income;
				}
				else
				{
					$data["settings"]["direct_settings2"][$g->membership_id][$g2->membership_id] = 0;
				}
			}
		}
		$check12 = Tbl_direct_bonus::where("archive",0)->select("direct_bonus_id","hierarchy","direct_bonus_checkpoint","direct_bonus_amount","archive")->first();
		if (!$check12) 
		{
			$insert["hierarchy"]         	   = 1;
			$insert["direct_bonus_checkpoint"] = 0;
			$insert["direct_bonus_amount"]     = 0;

			Tbl_direct_bonus::insert($insert);
		}
		$data["settings"]["manage_direct_bonus"] = Tbl_direct_bonus::where("archive",0)->select("direct_bonus_id","hierarchy","direct_bonus_checkpoint","direct_bonus_amount","archive")->get();

		return $data;
	}

	public static function INDIRECT()
	{
		$plan 				   = Tbl_mlm_plan::where("mlm_plan_code","INDIRECT")->first();
		$data["label"]         = Plan::get_label($plan->mlm_plan_code);
		$data["status"]        = $plan->mlm_plan_enable;

		$data["settings"]      = [];
		$get                   = Tbl_membership_indirect_level::get();
		$membership            = Tbl_membership::where("archive",0)->get();

		$data["settings"]["indirect_settings"] = [];
		$data["settings"]["membership_level"]  = [];

		foreach($membership as $memb)
		{
			$data["settings"]["membership_level"][$memb->membership_id] = array_fill(0, $memb->membership_indirect_level, "");
		}

		foreach($membership as $memb)
		{
			foreach($membership as $memb2)
			{
				$membership_indirect_level = $memb->membership_indirect_level + 1;
				for($level = 2; $level <= $membership_indirect_level ; $level++)
				{
					$percent_value = Tbl_membership_indirect_level::where("membership_id",$memb->membership_id)->where("membership_entry_id",$memb2->membership_id)->where("membership_level",$level)->first();
					$percent_value = $percent_value ? $percent_value->membership_indirect_income : 0;

					$data["settings"]["indirect_settings"][$memb->membership_id][$memb2->membership_id][$level] = $percent_value;
				}
			}
		}

		return $data;
	}

	public static function UNILEVEL()
	{

		$plan 				   = Tbl_mlm_plan::where("mlm_plan_code","UNILEVEL")->first();
		$data["label"]         = Plan::get_label($plan->mlm_plan_code);
		$data["status"]        = $plan->mlm_plan_enable;

		$data["settings"]      = [];
		$get                   = Tbl_membership_unilevel_level::get();
		$membership            = Tbl_membership::where("archive",0)->get();

		$check_exist = Tbl_mlm_unilevel_settings::first();
		if(!$check_exist)
		{
			$settings["personal_as_group"]		  	= 0;
			$settings["gpv_to_wallet_conversion"] = 0;
			$settings["auto_ship"] 				  			= 0;
			$settings["is_dynamic"] 				  		= 'normal';
			Tbl_mlm_unilevel_settings::insert($settings);
		}

		$data["settings"]["setup"]             		  = Tbl_mlm_unilevel_settings::first();
		$data["settings"]["setup"]->personal_pv       = Plan::get_label("PERSONAL_PV");
		$data["settings"]["setup"]->group_pv          = Plan::get_label("GROUP_PV");
		$data["settings"]["unilevel_settings"]        = [];
		$data["settings"]["membership_level"]         = [];

		foreach($membership as $memb)
		{
			$data["settings"]["membership_level"][$memb->membership_id] = array_fill(0, $memb->membership_unilevel_level, "");
		}


		foreach($membership as $memb)
		{
			foreach($membership as $memb2)
			{
				for($level = 1; $level <= $memb->membership_unilevel_level ; $level++)
				{
					$percent_value = Tbl_membership_unilevel_level::where("membership_id",$memb->membership_id)->where("membership_entry_id",$memb2->membership_id)->where("membership_level",$level)->first();
					$percent_value = $percent_value ? $percent_value->membership_percentage : 0;

					$data["settings"]["unilevel_settings"][$memb->membership_id][$memb2->membership_id][$level] = $percent_value;
				}
			}
		}

		// echo "<pre>";
		// var_dump($data);
		// echo "</pre>";

		// dd(123);
		return $data;
	}

	public static function BINARY()
	{
		$plan 				   = Tbl_mlm_plan::where("mlm_plan_code","BINARY")->first();
		$data["label"]         = Plan::get_label($plan->mlm_plan_code);
		$data["status"]        = $plan->mlm_plan_enable;

		$data["settings"]      = [];
		
		$data["settings"]["mentors_bonus_label"] = Plan::get_label("MENTORS_BONUS");
		$data["settings"]["binary_projected_income_label"] = Plan::get_label("BINARY_PROJECTED_INCOME");
		$data["settings"]["binary_slot_limit_settings"] = [];

		$check_exist = Tbl_binary_settings::first();
		if(!$check_exist)
		{
			$setting["auto_placement"]               	 = 0;
			$setting["auto_placement_type"]          	 = 0;
			$setting["member_disable_auto_position"] 	 = 0;
			$setting["member_default_position"]      	 = 0;
			$setting["strong_leg_retention"]         	 = 0;
			$setting["gc_pairing_count"]             	 = 0;
			$setting["crossline"]             		 	 = 0;
			$setting["cycle_per_day"]                	 = 1;
			$setting["included_binary_repurchase"]   	 = 0;
			$setting["amount_binary_limit"]          	 = 0;
			$setting["mentors_matching_cycle"]       	 = 1;
			$setting["mentors_matching_limit"]       	 = 0;
			$setting["binary_points_enable"]         	 = 0;
			$setting["binary_points_minimum_conversion"] = 0;
			$setting["mentors_points_enable"]         	 = 0;
			$setting["mentors_points_minimum_conversion"] = 0;
			$setting["binary_extreme_position"] = 0;
			Tbl_binary_settings::insert($setting);
		}

		$data["settings"]["setup"]                               = Tbl_binary_settings::first();
		$data["settings"]["setup"]->binary_points_left           = Plan::get_label("BINARY_POINTS_LEFT");
		$data["settings"]["setup"]->binary_points_right          = Plan::get_label("BINARY_POINTS_RIGHT");

		$data["settings"]["binary_settings_pair"] 	  			 = [];
		$data["settings"]["binary_settings_pair_end"] 			 = (object)array("binary_pairing_id"=>"","binary_pairing_left"=>"","binary_pairing_right"=>"","binary_pairing_bonus"=>"","binary_pairing_membership" => "");

		$data["settings"]["label_log"]["binary_points_left"]  = "Left Points";
		$data["settings"]["label_log"]["binary_points_right"] = "Right Points";

		$binary_pairing    = Tbl_binary_pairing::where("archive",0)
											   ->get();
		$array = array();
		foreach($binary_pairing as $key => $bpair)
		{
			$binary_pairing[$key]->binary_pairing_membership = $binary_pairing[$key]->binary_pairing_membership == null ? 0 : $binary_pairing[$key]->binary_pairing_membership;
			array_push($array,$bpair);
		}

		$data["settings"]["mentors_level"]    = [];
		$data["settings"]["mentors_settings"] = [];
		$membership 					   = Tbl_membership::where("archive",0)->get();
		foreach($membership as $memb)
		{
			$data["settings"]["mentors_level"][$memb->membership_id] = array_fill(0, $memb->mentors_level, "");
		}

		foreach($membership as $key => $memb)
		{
			$data["settings"]["membership_level"][$memb->membership_id] = $memb->membership_binary_level;
		}

		$get = Tbl_membership_mentors_level::get();

		foreach($get as $g)
		{
			$data["settings"]["mentors_settings"][$g->membership_id][$g->membership_level] = [];
			$data["settings"]["mentors_settings"][$g->membership_id][$g->membership_level] = [];

			$data["settings"]["mentors_settings"][$g->membership_id][$g->membership_level]["mentors_bonus"] = $g->mentors_bonus;
			$data["settings"]["mentors_settings"][$g->membership_id][$g->membership_level]["mentors_direct"] = $g->mentors_direct;
		}

		$data["settings"]["binary_settings_pair"]        = $array;
		$data["settings"]["count_binary_settings_pair"]  = count($array);


		$data["settings"]["binary_settings"] 	      = [];
		$get                                          = Tbl_membership::where("archive",0)->get();
		foreach($get as $g)
		{
			foreach($get as $g2)
			{
				$check = Tbl_binary_points_settings::where("membership_id",$g->membership_id)->where("membership_entry_id",$g2->membership_id)->first();
				if($check)
				{
					$data["settings"]["binary_settings"][$g->membership_id][$g2->membership_id] = $check->membership_binary_points;
					$data["settings"]["binary_slot_limit_settings"][$g->membership_id][$g2->membership_id] = $check->max_slot_per_level;
				}
				else
				{
					$data["settings"]["binary_settings"][$g->membership_id][$g2->membership_id] = 0;
					$data["settings"]["binary_slot_limit_settings"][$g->membership_id][$g2->membership_id] = 0;
				}
			}
		}
		return $data;
	}

    public static function BINARY_REPURCHASE()
    {
    	$plan                  = Tbl_mlm_plan::where("mlm_plan_code","BINARY_REPURCHASE")->first();
        $data["label"]         = Plan::get_label($plan->mlm_plan_code);
        $data["status"]        = $plan->mlm_plan_enable;
		return $data;
	}

	public static function DROPSHIPPING_BONUS()
    {
    	$plan                  = Tbl_mlm_plan::where("mlm_plan_code","DROPSHIPPING_BONUS")->first();
        $data["label"]         = Plan::get_label($plan->mlm_plan_code);
        $data["status"]        = $plan->mlm_plan_enable;
		return $data;
	}
	public static function WELCOME_BONUS()
    {
    	$plan = Tbl_mlm_plan::where("mlm_plan_code","WELCOME_BONUS")->first();
		$data["settings"] = [];
		$data["settings"]["commission"] = [];
		$membership_list = Tbl_membership::where('archive', 0)->get();
		
		foreach($membership_list as $membership) {
			$commissions = Tbl_welcome_bonus_commissions::where('membership_id', $membership->membership_id)->first();
			if(!$commissions) {
				$insert["membership_id"] = $membership->membership_id;
				$insert["commission"] = 0;
				Tbl_welcome_bonus_commissions::insert($insert);
			} 
		}
		foreach (Tbl_welcome_bonus_commissions::get() as $settings) {
			$data["settings"]["commission"][$settings->membership_id] = $settings;
		}
        $data["label"]         = Plan::get_label($plan->mlm_plan_code);
        $data["status"]        = $plan->mlm_plan_enable;
		return $data;
	}

	public static function MEMBERSHIP_UPGRADE()
	{
		$plan                  = Tbl_mlm_plan::where("mlm_plan_code","MEMBERSHIP_UPGRADE")->first();
		$data["label"]         = Plan::get_label($plan->mlm_plan_code);
		$data["status"]        = $plan->mlm_plan_enable;
		$check                 = Tbl_membership_upgrade_settings::first();
		if(!$check)
		{
			$insert["membership_upgrade_settings_method"] = "direct_downlines";
			Tbl_membership_upgrade_settings::insert($insert);
		}
		$data["settings"] = Tbl_membership_upgrade_settings::first();
		return $data;
	}
}
