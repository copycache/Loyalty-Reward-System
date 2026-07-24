<?php
namespace App\Globals;

use Carbon\Carbon;

use App\Globals\Log;
use App\Globals\Mlm_complan_manager;

use App\Models\Tbl_slot;
use App\Models\Tbl_tree_sponsor;
use App\Models\Tbl_membership_unilevel_level;
use App\Models\Tbl_membership;
use App\Models\Tbl_item;

class Mlm_complan_manager_repurchase
{
    
    public static function binary_repurchase($slot_info, $binary_pts)
    {
        if($binary_pts != 0)
        {
            Mlm_complan_manager::binary($slot_info, $binary_pts);
        }
    }

	public static function unilevel($slot_info, $points, $item_id = null)
	{
        if($points != 0)
        {

            /* ADD POINTS ON SLOT */
            /* FOR RECORDING ONLY*/
            // $update_slot_child["slot_personal_spv"] = Tbl_slot::where("slot_id",$slot_info->slot_id)->first()->slot_personal_pv + $points;
            // Tbl_slot::where("slot_id",$slot_info->slot_id)->update($update_slot_child);

            Log::insert_points($slot_info->slot_id,$points,"UNILEVEL_PPV",$slot_info->slot_id, 0);
            Log::insert_unilevel_points($slot_info->slot_id,$points,"UNILEVEL_PPV",$slot_info->slot_id,0,$item_id);

            $unilevel_level = Tbl_membership::where('membership_id', $slot_info->slot_membership)->first()->membership_unilevel_level;
            $gained_level = [];
            $all_levels = $unilevel_level ? range(1, $unilevel_level) : 0;
            $slot_tree = Tbl_tree_sponsor::where("sponsor_child_id",$slot_info->slot_id)->where("sponsor_parent_id", "!=", 1)->orderby("sponsor_level", "asc")->get();
            
            foreach($slot_tree as $key => $tree)
            {
                /* GET SPONSOR AND GET UNILEVEL BONUS INCOME PERCENTAGE  */
                $slot_sponsor   = Tbl_slot::where("slot_id",$tree->sponsor_parent_id)->first();
                $unilevel_percentage = Tbl_membership_unilevel_level::where("membership_id",$slot_sponsor->slot_membership)->where("membership_entry_id",$slot_info->slot_membership)->where("membership_level",$tree->sponsor_level)->first();
                if($unilevel_percentage)
                {
                    $unilevel_pts = ($unilevel_percentage->membership_percentage/100) * $points;
                }
                else
                {
                    $unilevel_pts = 0;
                }
                /* CHECK IF BONUS IS ZERO */
                if($unilevel_pts != 0)
                {
                    /* ADD POINTS ON SLOT */
                    // $update_slot_parent["slot_group_pv"] = Tbl_slot::where("slot_id",$slot_sponsor->slot_id)->first()->slot_group_pv + $unilevel_pts;
                    // Tbl_slot::where("slot_id",$slot_sponsor->slot_id)->update($update_slot_parent);
                    // dd($item_id);
                    $gained_level[] = $tree->sponsor_level;
                    Log::insert_points($slot_sponsor->slot_id,$unilevel_pts,"UNILEVEL_GPV",$slot_info->slot_id, $tree->sponsor_level);
                    Log::insert_unilevel_points($slot_sponsor->slot_id,$unilevel_pts,"UNILEVEL_GPV",$slot_info->slot_id, $tree->sponsor_level,$item_id);
                }
            } 
            // if (count($gained_level)) {
            //     Mlm_complan_manager::ungained_earnings_based_on_levels($all_levels, $gained_level, $slot_info, "unilevel", $item_id, $points);
            // }
        }
	}
}