<?php
namespace App\Globals;

use App\Models\Tbl_welcome_bonus_commissions;
use DB;
use Carbon\Carbon;
use App\Globals\Log;
use App\Globals\Special_plan;
use App\Globals\Slot;

use App\Models\Tbl_slot;
use App\Models\Tbl_binary_points;
use App\Models\Tbl_mlm_plan;
use App\Models\Tbl_membership_income;
use App\Models\Tbl_binary_points_settings;
use App\Models\Tbl_tree_placement;
use App\Models\Tbl_tree_sponsor;
use App\Models\Tbl_binary_pairing;
use App\Models\Tbl_membership_indirect_level;
use App\Models\Tbl_binary_settings;
use App\Models\Tbl_earning_log;
use App\Models\Tbl_currency;
use App\Models\Tbl_membership;
use App\Models\Tbl_membership_gc_income;
use App\Models\Tbl_direct_bonus;
use App\Models\Tbl_indirect_settings;
use App\Models\Users;
use App\Models\Tbl_membership_unilevel_level;
use App\Models\Tbl_binary_projected_income_log;
use App\Models\Tbl_membership_upgrade_settings;


class Mlm_complan_manager
{
    public static function membership_upgrade($slot_info)
    {
        $settings = Tbl_membership_upgrade_settings::first();
        $upgrade_method = $settings ? $settings->membership_upgrade_settings_method : "direct_downlines";

        if ($upgrade_method == "direct_downlines") 
        {
            $slot_tree = Tbl_tree_sponsor::where("sponsor_child_id", $slot_info->slot_id)
                            ->orderBy("sponsor_level", "desc")
                            ->get();

            foreach ($slot_tree as $tree) 
            {
                $slot_sponsor = Tbl_slot::where("slot_id", $tree->sponsor_parent_id)
                    ->join("tbl_membership", "tbl_slot.slot_membership", "=", "tbl_membership.membership_id")
                    ->first();

                if (!$slot_sponsor) continue;

                $next_membership = Tbl_membership::where("hierarchy", ">", $slot_sponsor->hierarchy)
                    ->where("archive", 0)
                    ->orderBy("hierarchy", "asc")
                    ->first();

                if (!$next_membership) continue;

                $directs = Tbl_slot::where("slot_sponsor", $slot_sponsor->slot_id)->count();
                $downlines = Tbl_tree_sponsor::where("sponsor_parent_id", $slot_sponsor->slot_id)->count();

                if ($directs >= $next_membership->required_directs && $downlines >= $next_membership->required_downlines)
                {
                    // Log upgrade
                    DB::table("tbl_membership_upgrade_logs")->insert([
                        "slot_id" => $slot_sponsor->slot_id,
                        "old_membership_id" => $slot_sponsor->slot_membership,
                        "new_membership_id" => $next_membership->membership_id,
                        "upgraded_at" => Carbon::now(),
                    ]);

                    // Update membership
                    Tbl_slot::where("slot_id", $slot_sponsor->slot_id)
                        ->update(["slot_membership" => $next_membership->membership_id]);

                    // Flushout points if enabled
                    if ($slot_sponsor->flushout_enable == 1) 
                    {
                        $flushout_points = [
                            "left" => $slot_sponsor->slot_left_points,
                            "right" => $slot_sponsor->slot_right_points,
                        ];

                        $receive = [
                            "left" => -1 * $flushout_points["left"],
                            "right" => -1 * $flushout_points["right"],
                        ];

                        $old = [
                            "left" => $slot_sponsor->slot_left_points,
                            "right" => $slot_sponsor->slot_right_points,
                        ];

                        $new = ["left" => 0, "right" => 0];

                        // Insert log for left/right flushout
                        Log::insert_points($slot_sponsor->slot_id, $receive["left"], "BINARY_LEFT_FLUSHOUT", $slot_info->slot_id, 0);
                        Log::insert_points($slot_sponsor->slot_id, $receive["right"], "BINARY_RIGHT_FLUSHOUT", $slot_info->slot_id, 0);

                        // Reset points
                        Tbl_slot::where("slot_id", $slot_sponsor->slot_id)
                            ->update(["slot_left_points" => 0, "slot_right_points" => 0]);

                        // Record binary flushout
                        Log::insert_binary_points(
                            $slot_sponsor->slot_id,
                            $receive,
                            $old,
                            $new,
                            $slot_sponsor->slot_id,
                            0,
                            0,
                            0,
                            "Membership Upgrade",
                            0,
                            $flushout_points,
                            0
                        );
                    }
                }
            }
        } 
        else // upgrade method: based on points
        {
            $membership = Tbl_membership::where("membership_id", $slot_info->slot_membership)->first();
            if (!$membership) return;

            $given_points = $membership->given_upgrade_points;
            $slot_sponsor = Tbl_slot::where("slot_id", $slot_info->slot_sponsor)
                ->join("tbl_membership", "tbl_slot.slot_membership", "=", "tbl_membership.membership_id")
                ->first();

            if (!$slot_sponsor) return;

            $next_levels = Tbl_membership::where("hierarchy", ">", $slot_sponsor->hierarchy)
                ->where("archive", 0)
                ->orderBy("hierarchy", "asc")
                ->get();

            $total_points = $slot_sponsor->slot_upgrade_points + $given_points;
            Tbl_slot::where("slot_id", $slot_sponsor->slot_id)->update(["slot_upgrade_points" => $total_points]);

            foreach ($next_levels as $next_level) 
            {
                if ($total_points >= $next_level->required_upgrade_points) 
                {
                    // Log upgrade
                    DB::table("tbl_membership_upgrade_logs")->insert([
                        "slot_id" => $slot_sponsor->slot_id,
                        "old_membership_id" => $slot_sponsor->slot_membership,
                        "new_membership_id" => $next_level->membership_id,
                        "upgraded_at" => Carbon::now(),
                    ]);

                    // Update membership
                    Tbl_slot::where("slot_id", $slot_sponsor->slot_id)
                        ->update(["slot_membership" => $next_level->membership_id]);

                    // Flushout points if enabled
                    if ($slot_sponsor->flushout_enable == 1)
                    {
                        $flushout_points = [
                            "left" => $slot_sponsor->slot_left_points,
                            "right" => $slot_sponsor->slot_right_points,
                        ];

                        $receive = [
                            "left" => -1 * $flushout_points["left"],
                            "right" => -1 * $flushout_points["right"],
                        ];

                        $old = [
                            "left" => $slot_sponsor->slot_left_points,
                            "right" => $slot_sponsor->slot_right_points,
                        ];

                        $new = ["left" => 0, "right" => 0];

                        Log::insert_points($slot_sponsor->slot_id, $receive["left"], "BINARY_LEFT_FLUSHOUT", $slot_info->slot_id, 0);
                        Log::insert_points($slot_sponsor->slot_id, $receive["right"], "BINARY_RIGHT_FLUSHOUT", $slot_info->slot_id, 0);

                        Tbl_slot::where("slot_id", $slot_sponsor->slot_id)
                            ->update(["slot_left_points" => 0, "slot_right_points" => 0]);

                        Log::insert_binary_points(
                            $slot_sponsor->slot_id,
                            $receive,
                            $old,
                            $new,
                            $slot_sponsor->slot_id,
                            0,
                            0,
                            0,
                            "Membership Upgrade",
                            0,
                            $flushout_points,
                            0
                        );
                    }
                }
            }
        }
    }

	public static function binary($slot_info , $binary_repurchase_pts = 0)
	{
        $is_included      = Tbl_binary_settings::first() ? Tbl_binary_settings::first()->included_binary_repurchase: 0;
        $limit_membership = Tbl_membership::where("membership_id",$slot_info->slot_membership)->first()->membership_binary_level;
        $binary_settings = Tbl_binary_settings::first();
        
        if($limit_membership == 0 || ($binary_repurchase_pts != 0 && $is_included == 0))
        {
            $tree_placement = Tbl_tree_placement::where("placement_child_id",$slot_info->slot_id)->orderBy("placement_level","ASC")->get();
        }
        else 
        {   
            $tree_placement = Tbl_tree_placement::where("placement_child_id",$slot_info->slot_id)->orderBy("placement_level","ASC")->limit($limit_membership)->get();            
        }
		foreach($tree_placement as $tree)
		{
            $can_recieve_points  = Tbl_slot::where("slot_id",$tree->placement_parent_id)->JoinMembership()->first() ? Tbl_slot::where("slot_id",$tree->placement_parent_id)->JoinMembership()->first()->can_receive_points : 1;
            if($can_recieve_points == 1)
            {
                $slot_placement  = Tbl_slot::JoinMembership()->where("slot_id",$tree->placement_parent_id)->first();
                $points_settings = Tbl_binary_points_settings::where("membership_id",$slot_placement->slot_membership)->where("membership_entry_id",$slot_info->slot_membership)->first();
                $leg_limit       = Tbl_binary_settings::first() ? Tbl_binary_settings::first()->strong_leg_limit_points : 0;
                $max_binary_points_per_level = Tbl_membership::where('membership_id', $slot_placement->slot_membership)->first()->max_points_per_level;
                $max_binary_earnings_per_level = Tbl_membership::where('membership_id', $slot_placement->slot_membership)->first()->max_earnings_per_level;
                $maxed_slot = Tbl_binary_points_settings::where("membership_id", $slot_placement->slot_membership)->where("membership_entry_id", $slot_info->slot_membership)->first()->max_slot_per_level;
                $tree_details = Tbl_tree_placement::where('placement_parent_id', $slot_placement->slot_id)->where('placement_child_id', $slot_info->slot_id)->first();
                if($binary_repurchase_pts != 0)
                {
                    $points = $binary_repurchase_pts;
                }
                else if($points_settings)
                {
                    $points = $points_settings->membership_binary_points;

                    if($binary_settings->binary_maximum_points_per_level_enable && $max_binary_points_per_level) {
                        $plan_type = "BINARY_" . strtoupper($tree->placement_position);
                        $binaryPoints = Tbl_binary_points::where('binary_points_slot_id', $slot_placement->slot_id)
                            ->where('binary_cause_level', $tree->placement_level)
                            ->selectRaw(
                                'SUM(binary_receive_left) as left_points, 
                                SUM(binary_receive_right) as right_points, 
                                SUM(binary_points_income) as earnings'
                            )
                            ->first(); 
                        $binarySlots = Tbl_binary_points::where('binary_points_slot_id', $slot_placement->slot_id)
                            ->where('binary_cause_membership_id', $slot_info->slot_membership)
                            ->where('binary_cause_level', $tree->placement_level)
                            ->selectRaw(
                                'GROUP_CONCAT(binary_points_id) as all_tree_id'
                            )
                            ->first(); 
    
                        $left_slot = 0;
                        $right_slot = 0;
                        $number_of_slot = 0;
                        if($binarySlots->all_tree_id) {
                            $tree_ids = explode(',', $binarySlots->all_tree_id);
                            foreach ($tree_ids as $log_id) {
                                $tree_log = Tbl_binary_points::where('binary_points_id', $log_id)->first();
                                $log_details = Tbl_slot::where('slot_id', $tree_log->binary_cause_slot_id)
                                ->leftJoin('tbl_tree_placement', 'tbl_slot.slot_id', '=', 'tbl_tree_placement.placement_child_id')
                                ->where('tbl_tree_placement.placement_parent_id', $slot_placement->slot_id)
                                ->first();
        
                                if($log_details->placement_position == 'LEFT') {
                                    $left_slot++;
                                } else if($log_details->placement_position == 'RIGHT') {
                                    $right_slot++;
                                }
                            }
                        }
    
                        if($tree_details->placement_position == 'LEFT') {
                            $number_of_slot = $left_slot;
                        } else if($tree_details->placement_position == 'RIGHT') {
                            $number_of_slot = $right_slot;
                        }
                        
                        if($number_of_slot < $maxed_slot || !$maxed_slot) {
                            if ($plan_type == 'BINARY_LEFT') {
                                if ($binaryPoints->left_points < $max_binary_points_per_level || !$max_binary_points_per_level) {
                                    $points = min($points, $max_binary_points_per_level - $binaryPoints->left_points);
                                } else {
                                    $points = 0;
                                }
                            } elseif ($plan_type == 'BINARY_RIGHT') {
                                if ($binaryPoints->right_points < $max_binary_points_per_level || !$max_binary_points_per_level) {
                                    $points = min($points, $max_binary_points_per_level - $binaryPoints->right_points);
                                } else {
                                    $points = 0;
                                }
                            }
                        } else {
                            $points = 0;
                        }
                    }
                }
                else
                {
                    $points = 0;
                }
                        
                $receive["left"]          = 0;
                $receive["right"]         = 0;
                $old["left"]              = $slot_placement->slot_left_points;
                $old["right"]             = $slot_placement->slot_right_points;
                $new["left"]              = $slot_placement->slot_left_points;
                $new["right"]             = $slot_placement->slot_right_points;
                $flushout_points["right"] = 0;
                $flushout_points["left"]  = 0;
                $log_earnings             = 0;
                $log_flushout             = 0;
                $gc_gained                = 0;
                $proceed_flushout         = 0;

                if($points != 0)
                {
                    $position = strtolower($tree->placement_position);
                    if($position == "left" || $position == "right")
                    {
                        /* MAXIMUM POINTS */
                        if($leg_limit != 0)
                        {
                            if( ($new[$position] + $points) >= $leg_limit)
                            {
                                $new[$position]             = $new[$position] + $points;
                                $diff                       = $new[$position] - $leg_limit;
                                $flushout_points[$position] = $flushout_points[$position] + $diff;
                                $receive[$position]         = $points - $diff;
                                $new[$position]             = $new[$position] - $diff;
                                $points                     = $points - $diff;
                            }
                            else 
                            {
                                $receive[$position] = $points;
                                $new[$position]     = $new[$position] + $points;
                            }
                        }
                        else 
                        {
                            $receive[$position] = $points;
                            $new[$position]     = $new[$position] + $points;
                        }
                        $temp_log_earnings = 0;
                        $update        = null;
                        $update_string = "slot_".$position."_points";
                        $update[$update_string] = Tbl_slot::where("slot_id",$slot_placement->slot_id)->first()->$update_string + $points;

                        Tbl_slot::where("slot_id",$slot_placement->slot_id)->update($update);
                        
                        $count_direct = 0;
                        $direct_required = 0;

                        if ($binary_settings->binary_required_direct_enable) {
                            $count_direct = Tbl_slot::where("slot_sponsor", $slot_placement->slot_id)->count();
                            $direct_required = Tbl_membership::where("membership_id", $slot_placement->slot_membership)->value('binary_required_direct');
                        }
                        // Check if the condition is met or the feature is disabled
                        if (!$binary_settings->binary_required_direct_enable || $count_direct >= $direct_required) {
                            $plan_type = "BINARY_" . strtoupper($tree->placement_position);
                            Log::insert_points($slot_placement->slot_id, $points, $plan_type, $slot_info->slot_id, $tree->placement_level);
                            
                            $binary["left"]  = Tbl_slot::where("slot_id",$slot_placement->slot_id)->first()->slot_left_points;
                            $binary["right"] = Tbl_slot::where("slot_id",$slot_placement->slot_id)->first()->slot_right_points;
        
                            $pairing_settings = Tbl_binary_pairing::where("archive",0)
                                ->orderBy("binary_pairing_right","DESC")
                                ->orderBy("binary_pairing_left","DESC")
                                ->where("binary_pairing_bonus","!=",0)
                                ->where("binary_pairing_left","!=",0)
                                ->where("binary_pairing_right","!=",0)
                                ->where(function ($query) use ($slot_placement)
                                {
                                    $query->where('binary_pairing_membership', $slot_placement->slot_membership)
                                        ->orWhereNull('binary_pairing_membership', '=', null);
                                })
                                ->get();
                        
                            foreach($pairing_settings as $pairing)
                            {
                                while($binary["left"] >= $pairing->binary_pairing_left && $binary["right"] >= $pairing->binary_pairing_right)
                                {
                                    /* PAIR THE POINTS */
                                    $binary["left"]  = $binary["left"] - $pairing->binary_pairing_left;
                                    $binary["right"] = $binary["right"] - $pairing->binary_pairing_right;

                                    /* FOR LOGS BINARY PTS RECORD */
                                    $new["left"]     = $new["left"] - $pairing->binary_pairing_left; 
                                    $new["right"]    = $new["right"] - $pairing->binary_pairing_right;
                                    $log_earnings    = $log_earnings + $pairing->binary_pairing_bonus;
                                    $income_binary   = $pairing->binary_pairing_bonus;
        
                                    /* ANOTHER RECORD FOR POINTS LOG */
                                    $plan_type = "BINARY_LEFT";
                                    Log::insert_points($slot_placement->slot_id,(-1 * $pairing->binary_pairing_left),$plan_type,$slot_info->slot_id, $tree->placement_level);
                                
                                    $plan_type = "BINARY_RIGHT";
                                    Log::insert_points($slot_placement->slot_id,(-1 * $pairing->binary_pairing_right),$plan_type,$slot_info->slot_id, $tree->placement_level);
                         
                                    /* UPDATE POINTS AND WALLET*/
                                    $update_slot["slot_left_points"]	= $binary["left"];
                                    $update_slot["slot_right_points"]	= $binary["right"];
                                    Tbl_slot::where("slot_id",$slot_placement->slot_id)->update($update_slot);
        
                                    $currency_id     = 0;
        
                                    $gc = 0;
        
                                    /* GC VALIDATION */
                                    if($binary_settings->gc_pairing_count != 0 && $binary_settings->gc_pairing_count != 1)
                                    {
                                        $count_pairing = Tbl_earning_log::where("earning_log_slot_id",$slot_placement->slot_id)->where("earning_log_plan_type","BINARY")->first() ? Tbl_earning_log::where("earning_log_slot_id",$slot_placement->slot_id)->where("earning_log_plan_type","BINARY")->count() : 0;
                                        $count_pairing = $count_pairing + 1;
        
                                        if($count_pairing % $binary_settings->gc_pairing_count == 0)
                                        {
                                            $gc = 1;
                                        }
        
                                        if($gc == 1)
                                        {
                                            $gc_currency = Tbl_currency::where("currency_abbreviation","GC")->first();
        
                                            if($gc_currency)
                                            {
                                                $currency_id   = $gc_currency->currency_id;
                                                if($binary_settings->gc_paring_amount != 0 )
                                                {
                                                    $income_binary = $binary_settings->gc_paring_amount; 
                                                    $gc_gained     = $gc_gained + $binary_settings->gc_paring_amount;
                                                }
                                                else 
                                                {
                                                    $income_binary = $income_binary; 
                                                    $gc_gained     = $gc_gained + $income_binary;
                                                }
        
                                                $log_earnings  = 0;
                                            }  
                                        }
                                    }
        
                                    /* CONDITIONAL PAIRING BINARY VALIDATION */
                                    $has_paired_today  = 0;
                                    if($binary_repurchase_pts != 0)
                                    {
                                        $slot_date_pairing = Carbon::now();
                                    }
                                    else
                                    {
                                        $slot_date_pairing = Carbon::parse($slot_info->slot_date_placed);
                                    }
                                    $logs = Tbl_earning_log::where('earning_log_slot_id', $slot_placement->slot_id)->where('earning_log_plan_type','=','BINARY');

                                    if($binary_settings->cycle_per_day == 1)
                                    {
                                        $compare_date       = Carbon::parse($slot_date_pairing)->format("m-d-Y");
                                        $has_paired_today   = $slot_placement->slot_pairs_per_day_date == $compare_date ? 1 : 0;
                                        $today = Carbon::now()->format('Y-m-d');
                                        if ($slot_placement->binary_realtime_commission == 1) {
                                            $total_earnings_per_cycle = $logs->whereDate('earning_log_date_created', $today)->sum('earning_log_amount');
                                            $total_pairs_per_cycle = $logs->whereDate('earning_log_date_created', $today)->count();
                                        } else {
                                            $total_pairs_per_cycle = Tbl_binary_projected_income_log::where('slot_id', $slot_placement->slot_id)->where('wallet_amount', '!=', 0)->wheredate('date_created',$today)->count();
                                            $total_earnings_per_cycle = Tbl_binary_projected_income_log::where('slot_id', $slot_placement->slot_id)->where('wallet_amount', '!=', 0)->wheredate('date_created',$today)->sum('wallet_amount');

                                        }
                                    }
                                    else if($binary_settings->cycle_per_day == 2)
                                    {
                                        $compare_date       = Carbon::parse($slot_date_pairing)->format("m-d-Y");
                                        $compare_date_a     = Carbon::parse($slot_date_pairing)->format("A"); 
                                        $has_paired_today   = $slot_placement->slot_pairs_per_day_date == $compare_date && $slot_placement->meridiem == $compare_date_a ? 1 : 0;                                       
                                        $meridiem = Carbon::now()->format('A');
                                        
                                        if($meridiem == "AM")
                                        {
                                            // For AM, calculate earnings from the start of the day to noon
                                            $start_of_day = Carbon::now()->format('Y-m-d 00:00:00');
                                            $end_of_am = Carbon::now()->format('Y-m-d 11:59:59');
                                            $total_earnings_per_cycle = $logs
                                                ->where('earning_log_date_created', '>=', $start_of_day)
                                                ->where('earning_log_date_created', '<=', $end_of_am)
                                                ->sum('earning_log_amount');
                                            $total_pairs_per_cycle = $logs
                                                ->where('earning_log_date_created', '>=', $start_of_day)
                                                ->where('earning_log_date_created', '<=', $end_of_am)
                                                ->count();
                                        }
                                        else 
                                        {
                                            // For PM, calculate earnings from noon to the end of the day
                                            $start_of_pm = Carbon::now()->format('Y-m-d 12:00:00');
                                            $end_of_day = Carbon::now()->format('Y-m-d 23:59:59');
                                            $total_earnings_per_cycle = $logs
                                                ->where('earning_log_date_created', '>=', $start_of_pm)
                                                ->where('earning_log_date_created', '<=', $end_of_day)
                                                ->sum('earning_log_amount');
                                            $total_pairs_per_cycle = $logs
                                                ->where('earning_log_date_created', '>=', $start_of_pm)
                                                ->where('earning_log_date_created', '<=', $end_of_day)
                                                ->count();
                                        }
                                    }
                                    else if($binary_settings->cycle_per_day == 3)
                                    {
                                        $compare_date       = Carbon::parse($slot_date_pairing)->endofweek()->format("m-d-Y");
                                        $has_paired_today   = $slot_placement->slot_pairs_per_day_date == $compare_date ? 1 : 0;
                                        $start = Carbon::now()->startofWeek();
                                        $end = Carbon::now()->endofWeek();
                                        $total_earnings_per_cycle = $logs->where('earning_log_date_created',">=",$start)->where('earning_log_date_created',"<=",$end)->sum('earning_log_amount');
                                        $total_pairs_per_cycle = $logs->where('earning_log_date_created',">=",$start)->where('earning_log_date_created',"<=",$end)->count();
                                    } else if ($binary_settings->cycle_per_day == 4) {
                                        $compare_date = Carbon::parse($slot_date_pairing)->format("m-d-Y");
                                        $has_paired_today = $slot_placement->slot_pairs_per_day_date == $compare_date ? 1 : 0;
                                        $total_earnings_per_cycle = $logs->sum('earning_log_amount');
                                        $total_pairs_per_cycle = $logs->count();
                                    }
        
                                    /* PAIRINGS PER DAY FLUSHOUT CHECKING */
                                    $membership = Tbl_membership::where("membership_id",$slot_placement->slot_membership)->first();
                                    if($membership) {
                                        $limit_type = $binary_settings->binary_limit_type;
                                        if($has_paired_today == 1)
                                        {
                                            if($limit_type == 1 && $total_pairs_per_cycle >= $membership->membership_pairings_per_day && $membership->membership_pairings_per_day) {
                                                $proceed_flushout = 1;
                                                $log_flushout += $income_binary;

                                                if ($gc == 1) {
                                                    $gc_gained -= $income_binary;
                                                } else {
                                                    // $log_earnings -= $membership->auto_upgrade ? ($income_binary - $deduction) : $income_binary;
                                                    $log_earnings -= $income_binary;
                                                }
                                                $income_binary = 0;
                                            } else if($limit_type == 2) {
                                                $total = $total_earnings_per_cycle + $income_binary;
                                                if(round($total, 2) > round($membership->max_earnings_per_cycle, 2)) {
                                                    if(round($total_earnings_per_cycle, 2) >= round($membership->max_earnings_per_cycle, 2)) {
                                                        $log_flushout += $income_binary;
                                                        $log_earnings = 0;
                                                        $income_binary = 0;

                                                    } else {
                                                        // $income_binary = (round($total, 2) - round($membership->max_earnings_per_cycle, 2)) ;
                                                        // dd(round($total, 2), round($membership->max_earnings_per_cycle, 2), $income_binary);
                                                        $diff = (round($total, 2) - round($membership->max_earnings_per_cycle, 2));
                                                        $income_binary -= $diff;
                                                        $log_flushout += $diff;
                                                        $log_earnings -= $log_flushout;
                                                    }
                                                    $proceed_flushout = 1;
                                                }
                                            } else {
                                                $update_pairing_slot_mem["slot_pairs_per_day"] = $slot_placement->slot_pairs_per_day + 1;
                                                $update_pairing_slot_mem["meridiem"] = Carbon::parse($slot_date_pairing)->format("A");
                                                Tbl_slot::where("slot_id", $slot_placement->slot_id)->update($update_pairing_slot_mem);
                                            }
                                        }
                                        else
                                        {
                                            $update_pairing_slot_mem["slot_pairs_per_day_date"]  = $binary_settings->cycle_per_day == 3 ? Carbon::parse($slot_date_pairing)->endofweek()->format("m-d-Y") : Carbon::parse($slot_date_pairing)->format("m-d-Y");
                                            $update_pairing_slot_mem["meridiem"]                 = Carbon::parse($slot_date_pairing)->format("A");
                                            $update_pairing_slot_mem["slot_pairs_per_day"]       = 1;
                                            Tbl_slot::where("slot_id",$slot_placement->slot_id)->update($update_pairing_slot_mem);
                                        } 
                                        // else if($membership->max_earnings_per_level != 0) {
                                        //     $total_earning_per_level = Tbl_binary_points::where('binary_points_slot_id', $slot_placement->slot_id)
                                        //     ->where('binary_cause_level', $tree->placement_level)
                                        //     ->sum('binary_points_income');

                                        //     $total_earnings = $total_earning_per_level + $log_earnings;
                                            
                                        //     if ($total_earnings > $membership->max_earnings_per_level) {
                                        //         $diff = $total_earnings - $membership->max_earnings_per_level;
                                        //         $income_binary = max($income_binary - $diff, 0);
                                        //         $log_flushout += $diff;
                                        //         $log_earnings -= $diff;
                                        //         $proceed_flushout = 1;
                                        //     }
                                        // }
                                    }
        
        
                                    /* AMOUNT LIMIT PER DAY CHECKING */
                                    if($binary_settings->amount_binary_limit != 0)
                                    {
                                        if($has_paired_today == 1)
                                        {
                                            
                                            $balance    =   Tbl_binary_points::where("binary_points_slot_id",$slot_placement->slot_id);
        
                                            if($binary_settings->cycle_per_day == 1)
                                            {
                                                $balance->where("binary_points_date_received",">=",$slot_date_pairing->format("Y-m-d 00:00:00"));
                                            }
                                            else if($binary_settings->cycle_per_day == 2)
                                            {   
                                                $meridiem     = Carbon::parse($slot_date_pairing)->format("A"); 
                                                if($meridiem == "AM")
                                                {   
                                                    $date  =   Carbon::parse($slot_date_pairing)->format("Y-m-d 00:00:00");
                                                }
                                                else 
                                                {
                                                    $date  =   Carbon::parse($slot_date_pairing)->format("Y-m-d 12:00:00");
                                                }
                                                $balance->where("binary_points_date_received",">=",$date);
                                            }
                                            else
                                            {
                                                $date  =   Carbon::parse($slot_date_pairing)->startofweek();
                                                $balance->where("binary_points_date_received",">=",$date);
                                            }
        
                                            $balance =   $balance->sum("binary_points_income");
                                            $total = $balance + $income_binary;
                                            if($total > $binary_settings->amount_binary_limit)
                                            {
                                                $diff = $total - $binary_settings->amount_binary_limit;
                                                $income_binary = $income_binary - $diff; 
        
                                                $log_flushout  = $log_flushout + $diff;
        
                                                $log_earnings  = $income_binary;
                                            }
                                        }   
                                    }
        
                                    /* MENTORS BONUS */
                                    if($gc == 0 && $income_binary != 0)
                                    {
                                        /* MENTORS BONUS */
                                        Special_plan::mentors_bonus($slot_placement->slot_id,$income_binary,$slot_date_pairing);
                                    }
                                    
                                    /*LOGS*/
                                    $_binary_settings = Tbl_binary_settings::first();
                                    $_proceed = false;
                                    $_gc_currency = Tbl_currency::where("currency_abbreviation","GC")->first();
                                    if ($_gc_currency->currency_id != $currency_id) 
                                    {
                                        if($_binary_settings->binary_points_enable == 1)
                                        {
                                            if($_binary_settings->binary_points_minimum_conversion > 0)
                                            {
                                                $_MP = Tbl_currency::where("currency_abbreviation","MP")->first();
                                                if($_MP)
                                                {
                                                    $details = "";
                                                    Log::insert_wallet($slot_placement->slot_id,$income_binary,"BINARY",$_MP->currency_id);
                                                    Log::insert_earnings($slot_placement->slot_id,$income_binary,"BINARY","SLOT PLACEMENT",$slot_info->slot_id,$details,$tree->placement_level,$_MP->currency_id);

                                                    $_MP_wallet = Tbl_slot::where("tbl_slot.slot_id",$slot_placement->slot_id)->Wallet($_MP->currency_id)->first();
                                                    if ($_MP_wallet->wallet_amount >= $_binary_settings->binary_points_minimum_conversion) 
                                                    {
                                                        Log::insert_wallet($slot_placement->slot_id,$_MP_wallet->wallet_amount * -1,"BINARY_CONVERSION",$_MP->currency_id);
                                                        Log::insert_earnings($slot_placement->slot_id,$_MP_wallet->wallet_amount * -1,"BINARY_CONVERSION","SLOT PLACEMENT",$slot_info->slot_id,$details,$tree->placement_level,$_MP->currency_id);

                                                        Log::insert_wallet($slot_placement->slot_id,$_MP_wallet->wallet_amount,"MATCHED_POINTS_CONVERSION",$currency_id);
                                                        Log::insert_earnings($slot_placement->slot_id,$_MP_wallet->wallet_amount,"MATCHED_POINTS_CONVERSION","SLOT PLACEMENT",$slot_info->slot_id,$details,$tree->placement_level,$currency_id);
                                                    }
                                                }
                                                else 
                                                {
                                                    $_proceed = true;
                                                }
                                            }
                                            else 
                                            {
                                                $_proceed = true;
                                            }
                                        }
                                        else 
                                        {
                                            $_proceed = true;
                                        }
                                    }
                                    else
                                    {
                                        $_proceed = true;
                                    }

                                    
                                    if($_proceed)
                                    {
                                        $details = "";

                                        $status = 0;

                                        if($slot_placement->binary_realtime_commission == 1) {
                                            Log::insert_wallet($slot_placement->slot_id,$income_binary,"BINARY",$currency_id);
                                        }
                                        if($income_binary && $slot_placement->binary_realtime_commission == 1) {
                                            Log::insert_earnings($slot_placement->slot_id,$income_binary,"BINARY","SLOT PLACEMENT",$slot_info->slot_id,$details,$tree->placement_level,$currency_id);
                					        
                                        } else if($income_binary && $slot_placement->binary_realtime_commission == 0) {
                                            $insert["slot_id"] = $slot_placement->slot_id;
                                            $insert["membership_id"] = $slot_placement->slot_membership;
                                            $insert["cause_slot_id"] = $slot_info->slot_id;
                                            $insert["cause_membership_id"] = $slot_info->slot_membership;
                                            $insert["cause_level"] = $tree->placement_level;
                                            $insert["wallet_amount"] = $income_binary;
                                            $insert["status"] = $status;
                                            $insert["date_status_change"] = $status ? Carbon::now() : null;
                                            $insert["date_created"] = Carbon::now();
                                            Tbl_binary_projected_income_log::insert($insert);
                                        }
                                        
                                        /* GET THE LAST EARNINGS BEFORE FLUSHOUT */  
                                        if($log_earnings) {
                                            $temp_log_earnings = $log_earnings;
                                        } else {
                                            $log_earnings = $temp_log_earnings;
                                        }
                                    }
                                    /* REFRESH GET DATA ON POINTS */  
                                    $binary["left"]  = Tbl_slot::where("slot_id",$slot_placement->slot_id)->first()->slot_left_points;
                                    $binary["right"] = Tbl_slot::where("slot_id",$slot_placement->slot_id)->first()->slot_right_points;
                                    $slot_placement  = Tbl_slot::JoinMembership()->where("slot_id",$slot_placement->slot_id)->first();
                                }
                            }
                            $binary_settings = Tbl_binary_settings::first();
        
        
                            if($binary_settings->strong_leg_retention == 0)
                            {                   
                                if($proceed_flushout == 1)
                                {
                                        if($new["left"] != 0)
                                        {
                                            $plan_type = "BINARY_LEFT_FLUSHOUT";
                                            Log::insert_points($slot_placement->slot_id,(-1 * $new["left"]),$plan_type,$slot_info->slot_id, 0);                                 
                                            $flushout_points["left"] = $new["left"];
                                            $new["left"]  = $new["left"] - $new["left"];  
                                        }
                                        
                                        if($new["right"] != 0)
                                        {
                                            $plan_type = "BINARY_RIGHT_FLUSHOUT";
                                            Log::insert_points($slot_placement->slot_id,(-1 * $new["right"]),$plan_type,$slot_info->slot_id, 0);                                 
                                            $flushout_points["right"] = $new["right"];
                                            $new["right"] = $new["right"] - $new["right"];
                                        }
        
                                        $update_slot_flush["slot_left_points"]    = $new["left"];
                                        $update_slot_flush["slot_right_points"]   = $new["right"];
                                        Tbl_slot::where("slot_id",$slot_placement->slot_id)->update($update_slot_flush);
                                }
                            }
                            // For a single detail among multiple pairings
                            // $details = "";
                            // Log::insert_wallet($slot_placement->slot_id,$log_earnings,"BINARY");
                            // Log::insert_earnings($slot_placement->slot_id,$log_earnings,"BINARY","SLOT PLACEMENT",$slot_info->slot_id,$details,$tree->placement_level);
                            if($slot_placement->binary_realtime_commission == 1) {
                                Log::insert_binary_points($slot_placement->slot_id,$receive,$old,$new,$slot_info->slot_id,$log_earnings,$log_flushout,$tree->placement_level,"Slot Placement",$gc_gained,$flushout_points,null,$binary_repurchase_pts);
                            } else if ($slot_placement->binary_realtime_commission == 0) {
                                Log::insert_binary_points($slot_placement->slot_id,$receive,$old,$new,$slot_info->slot_id,0,$log_flushout,$tree->placement_level,"Slot Placement",$gc_gained,$flushout_points,$binary_repurchase_pts, null, $log_earnings);
                            }
                            
                        }
                    }
                }
            }
		}
	}

	public static function direct($slot_info)
	{
		/* CHECK SPONSOR SLOT*/
        $slot_sponsor = Tbl_slot::where('slot_id', $slot_info->slot_sponsor)->first();
        if($slot_sponsor)
        {
        	/* CHECK INCOME SETTINGS */
        	$membership_income = Tbl_membership_income::where("membership_id",$slot_sponsor->slot_membership)->where("membership_entry_id",$slot_info->slot_membership)->first();
        	if($membership_income)
        	{
        		$direct_income = $membership_income->membership_direct_income;
        	}
        	else
        	{
        		$direct_income = 0;
            }
            
            /* CHECK INCOME IN GC SETTINGS */
            $membership_income2 = Tbl_membership_gc_income::where("membership_id",$slot_sponsor->slot_membership)->where("membership_entry_id",$slot_info->slot_membership)->first();
            // dd($membership_income2["membership_gc_income"]);
        	if($membership_income2)
        	{
        		$gc_income = $membership_income2["membership_gc_income"];
        	}
        	else
        	{
        		$gc_income = 0;
        	}


        	/* IF DIRECT INCOME IS NOT 0 */
        	if($direct_income != 0)
        	{
                /*LOGS*/
                $details = "";

                Log::insert_wallet($slot_sponsor->slot_id,$direct_income,"DIRECT");
                Log::insert_earnings($slot_sponsor->slot_id,$direct_income,"DIRECT","SLOT CREATION",$slot_info->slot_id,$details,1);
            }

            /* IF GC INCOME IS NOT 0 */
        	if($gc_income != 0)
        	{
                /*LOGS*/

                $currency_id = Tbl_currency::where("currency_abbreviation","GC")->where("archive",0)->first() ? Tbl_currency::where("currency_abbreviation","GC")->where("archive",0)->first()->currency_id : null;
                $details = "";
                if($currency_id != null)
                {
                    Log::insert_wallet($slot_sponsor->slot_id,$gc_income,"DIRECT GC",$currency_id);
                    Log::insert_earnings($slot_sponsor->slot_id,$gc_income,"DIRECT GC","SLOT CREATION",$slot_info->slot_id,$details,1,$currency_id);
                }
            }
            
            /* IF DIRECT BONUS*/
            $direct_bonus = Tbl_direct_bonus::where("archive",0)->get();
            foreach ($direct_bonus as $key => $bonus) 
            {
                $check = Tbl_slot::where("slot_id",$slot_sponsor->slot_id)->first();
               if($check["bonus_no"] < $bonus["hierarchy"])
               {
                   $total_direct_earning =  Tbl_earning_log::where("earning_log_plan_type","DIRECT")->where("earning_log_slot_id",$slot_sponsor->slot_id)->sum("earning_log_amount");
                   if($total_direct_earning >= $bonus["direct_bonus_checkpoint"])
                   {
                       if($bonus["direct_bonus_amount"] != 0)
                       {
                           $details = "";
                           Log::insert_wallet($slot_sponsor->slot_id,$bonus["direct_bonus_amount"],"DIRECT BONUS");
                           Log::insert_earnings($slot_sponsor->slot_id,$bonus["direct_bonus_amount"],"DIRECT BONUS","SLOT CREATION",$slot_info->slot_id,$details,1);
                           Tbl_slot::where("slot_id",$slot_sponsor->slot_id)->update(["bonus_no"=>$bonus["hierarchy"]]);
                       }
                   }
               }
            }
        }
	}

    public static function indirect($slot_info)
    {
        $slot_tree         = Tbl_tree_sponsor::where("sponsor_child_id",$slot_info->slot_id)->where("sponsor_parent_id", "!=", 1)->where("sponsor_level","!=",1)->orderby("sponsor_level", "asc")->get();
        /* RECORD ALL INTO A SINGLE VARIABLE */
        /* CHECK IF LEVEL EXISTS */
        
        $indirect_level = Tbl_membership::where('membership_id', $slot_info->slot_membership)->first()->membership_indirect_level;
        $gained_level = [];
        $all_levels = range(2, $indirect_level + 1);

        foreach($slot_tree as $key => $tree)
        {
            /* GET SPONSOR AND GET INDIRECT BONUS INCOME */
            $slot_sponsor   = Tbl_slot::where("slot_id",$tree->sponsor_parent_id)->first();
            $indirect_bonus = Tbl_membership_indirect_level::where("membership_id",$slot_sponsor->slot_membership)->where("membership_entry_id",$slot_info->slot_membership)->where("membership_level",$tree->sponsor_level)->first();
            if($indirect_bonus)
            {
                $indirect_bonus = $indirect_bonus->membership_indirect_income;
            }
            else
            {
                $indirect_bonus = 0;
            }

            /* CHECK IF BONUS IS ZERO */
            if($indirect_bonus != 0)
            {
                /*LOGS*/
                $details = "";
                Log::insert_wallet($slot_sponsor->slot_id,$indirect_bonus,"INDIRECT");
                Log::insert_earnings($slot_sponsor->slot_id,$indirect_bonus,"INDIRECT","SLOT CREATION",$slot_info->slot_id,$details,$tree->sponsor_level);
            }
        } 
        if (count($gained_level)) {
            Self::ungained_earnings_based_on_levels($all_levels, $gained_level, $slot_info, "indirect");
        }
    }

    public static function welcome_bonus($slot_info) {
        
        if($slot_info)
        {
        	$welcome_bonus = Tbl_welcome_bonus_commissions::where("membership_id", $slot_info->slot_membership)->first();
        	if($welcome_bonus) {
        		$income = $welcome_bonus->commission;
        	} else {
        		$income = 0;
            }
        	if($income) {
                $details = "";
                Log::insert_wallet($slot_info->slot_id, $income, "WELCOME BONUS");
                Log::insert_earnings($slot_info->slot_id, $income, "WELCOME BONUS", "SLOT CREATION", $slot_info->slot_id, $details, 1);
            }
        }
    }

    public static function ungained_earnings_based_on_levels($all_levels, $gained_level, $slot, $plan, $item_id = 0, $points = 0) {

        $ungained_levels = array_diff($all_levels, $gained_level);
        $commission_ungained = 0;
        $company_account = Users::where("company_account", 1)->JoinSlot()->first();
        if($company_account) {
            foreach($ungained_levels as $level) {

               if ($plan == "indirect") {
                    $commission_settings = Tbl_membership_indirect_level::where("membership_id", $company_account->slot_membership)
                        ->where("membership_entry_id", $slot->slot_membership)
                        ->where("membership_level", $level)
                        ->first();
                    $plan_label = "INDIRECT";
                    $plan_trigger = "SLOT CREATION";
                    if(isset($commission_settings) && $commission_settings->membership_indirect_income) {
                        $commission_amount = $commission_settings->membership_indirect_income;
                        $commission_ungained += $commission_amount;
                    } else {
                        $commission_amount = 0;
                    }
                } else if ($plan == "unilevel") {
                    $commission_settings = Tbl_membership_unilevel_level::where("membership_id", $company_account->slot_membership)
                        ->where("membership_entry_id", $slot->slot_membership)
                        ->where("membership_level", $level)
                        ->first();
                    if(isset($commission_settings) && $commission_settings->membership_percentage) {
                        $commission_amount = ($commission_settings->membership_percentage/100) * $points;
                        $commission_ungained += $commission_amount;
                    } else {
                        $commission_amount = 0;
                    }
                }

            }

            if($plan != 'unilevel' && $commission_ungained != 0) {
                Log::insert_wallet($company_account->slot_id, $commission_ungained, $plan_label);
                Log::insert_earnings($company_account->slot_id, $commission_ungained, $plan_label, $plan_trigger, $slot->slot_id, "", 0);
            } else if ($plan == 'unilevel') {
                Log::insert_points($company_account->slot_id, $commission_ungained,"UNILEVEL_GPV", $slot->slot_id, 0);
                Log::insert_unilevel_points($company_account->slot_id, $commission_ungained, "UNILEVEL_GPV", $slot->slot_id, 0, $item_id);
            }
        }
    }

    
}
