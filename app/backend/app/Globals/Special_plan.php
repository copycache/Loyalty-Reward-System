<?php
namespace App\Globals;


use App\Models\Tbl_mlm_plan;
use App\Models\Tbl_membership;
use App\Models\Tbl_tree_sponsor;
use App\Models\Tbl_membership_mentors_level;
use App\Models\Tbl_slot;
use App\Models\Tbl_binary_settings;
use App\Models\Tbl_wallet_log;
use App\Models\Tbl_currency;

use Carbon\Carbon;

use App\Globals\Log;

class Special_plan
{

    public static function mentors_bonus($slot_id,$amount,$date_pairing)
    {
        $binary_settings = Tbl_binary_settings::first();
        $mentors_limit   = $binary_settings->mentors_matching_limit;           
        $slot_placement  = Tbl_slot::where("slot_id",$slot_id)->first();
        $highest_level   = Tbl_membership::orderBy("mentors_level","DESC")->first();
        if($highest_level)
        {
            $get_mentor_tree = Tbl_tree_sponsor::where("sponsor_child_id",$slot_placement->slot_id)->where("sponsor_level","<=",$highest_level->mentors_level)->orderBy("sponsor_level","ASC")->get();

            foreach($get_mentor_tree as $mentor_tree)
            {
                $mentor_slot           = Tbl_slot::where("slot_id",$mentor_tree->sponsor_parent_id)->first();
                $check_mentor_settings = Tbl_membership_mentors_level::where("membership_level",$mentor_tree->sponsor_level)->where("membership_id",$mentor_slot->slot_membership)->first();
                if($check_mentor_settings)
                {
                    $count_direct = Tbl_tree_sponsor::where("sponsor_parent_id",$mentor_slot->slot_id)->where("sponsor_level",1)->count();
                    if($count_direct >= $check_mentor_settings->mentors_direct)
                    {
                        /*LOGS*/
                        // $details = "Paired by Slot ".$slot_info->slot_no;
                        $details = "";
                        if($check_mentor_settings->mentors_bonus != 0)
                        {                                                    
                            $income_mentors = $amount * ($check_mentor_settings->mentors_bonus/100);
                            if($income_mentors != 0)
                            {
                                $current_income = Special_plan::mentors_bonus_check_cycle($mentor_slot->slot_id,$date_pairing);
                                $flushed_out    = 0;
                                $total_income   = $current_income + $income_mentors;

                                if($total_income > $mentors_limit && $mentors_limit != 0)
                                { 
                                    $flushed_out            = $total_income - $mentors_limit;
                                    $computed_from_flushout = $income_mentors - $flushed_out;
                                    $flushed_out            = $computed_from_flushout < 0 ? $income_mentors : $flushed_out;
                                    $computed_from_flushout = $computed_from_flushout < 0 ? 0               : $computed_from_flushout;

                                    $_binary_settings = Tbl_binary_settings::first();
                                    $_proceed = false;
                                    if($_binary_settings->mentors_points_enable == 1)
                                    {
                                        if($_binary_settings->mentors_points_minimum_conversion > 0)
                                        {
                                            $_OLP = Tbl_currency::where("currency_abbreviation","OLP")->first();
                                            if($_OLP)
                                            {
                                                $wallet_log_id = Log::insert_wallet($mentor_slot->slot_id,$income_mentors,"MENTORS_BONUS",$_OLP->currency_id);
                                                                 Log::insert_earnings($mentor_slot->slot_id,$income_mentors,"MENTORS_BONUS","SLOT PLACEMENT",$slot_placement->slot_id,$details,$mentor_tree->sponsor_level,$_OLP->currency_id);

                                                $_OLP_wallet = Tbl_slot::where("slot_id",$mentor_slot->slot_id)->Wallet($_OLP->currency_id)->first();
                                                if ($_OLP_wallet->wallet_amount >= $_binary_settings->mentors_points_minimum_conversion) 
                                                {
                                                    Log::insert_wallet($mentor_slot->slot_id,$_OLP_wallet->wallet_amount * -1,"MENTORS_BONUS_CONVERSION",$_OLP->currency_id);
                                                    Log::insert_earnings($mentor_slot->slot_id,$_OLP_wallet->wallet_amount * -1,"MENTORS_BONUS_CONVERSION","SLOT PLACEMENT",$slot_placement->slot_id,$details,$mentor_tree->sponsor_level,$_OLP->currency_id);

                                                    Log::insert_wallet($mentor_slot->slot_id,$_OLP_wallet->wallet_amount,"ONE_LEG_POINTS_CONVERSION");
                                                    Log::insert_earnings($mentor_slot->slot_id,$_OLP_wallet->wallet_amount,"ONE_LEG_POINTS_CONVERSION","SLOT PLACEMENT",$slot_placement->slot_id,$details,$mentor_tree->sponsor_level);
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
                                         $wallet_log_id = Log::insert_wallet($mentor_slot->slot_id,$computed_from_flushout,"MENTORS_BONUS");
                                                          Log::insert_earnings($mentor_slot->slot_id,$computed_from_flushout,"MENTORS_BONUS","SLOT PLACEMENT",$slot_placement->slot_id,$details,$mentor_tree->sponsor_level);
                                    }
                                    
                                    Log::flushout_logs($flushed_out,$wallet_log_id);

                                }
                                else
                                {
                                    $_binary_settings = Tbl_binary_settings::first();
                                    $_proceed = false;
                                    if($_binary_settings->mentors_points_enable == 1)
                                    {
                                        if($_binary_settings->mentors_points_minimum_conversion > 0)
                                        {
                                            $_OLP = Tbl_currency::where("currency_abbreviation","OLP")->first();
                                            if($_OLP)
                                            {
                                                Log::insert_wallet($mentor_slot->slot_id,$income_mentors,"MENTORS_BONUS",$_OLP->currency_id);
                                                Log::insert_earnings($mentor_slot->slot_id,$income_mentors,"MENTORS_BONUS","SLOT PLACEMENT",$slot_placement->slot_id,$details,$mentor_tree->sponsor_level,$_OLP->currency_id);

                                                $_OLP_wallet = Tbl_slot::where("tbl_slot.slot_id",$mentor_slot->slot_id)->Wallet($_OLP->currency_id)->first();
                                                if ($_OLP_wallet->wallet_amount >= $_binary_settings->mentors_points_minimum_conversion) 
                                                {
                                                    Log::insert_wallet($mentor_slot->slot_id,$_OLP_wallet->wallet_amount * -1,"MENTORS_BONUS_CONVERSION",$_OLP->currency_id);
                                                    Log::insert_earnings($mentor_slot->slot_id,$_OLP_wallet->wallet_amount * -1,"MENTORS_BONUS_CONVERSION","SLOT PLACEMENT",$slot_placement->slot_id,$details,$mentor_tree->sponsor_level,$_OLP->currency_id);

                                                    Log::insert_wallet($mentor_slot->slot_id,$_OLP_wallet->wallet_amount,"ONE_LEG_POINTS_CONVERSION");
                                                    Log::insert_earnings($mentor_slot->slot_id,$_OLP_wallet->wallet_amount,"ONE_LEG_POINTS_CONVERSION","SLOT PLACEMENT",$slot_placement->slot_id,$details,$mentor_tree->sponsor_level);
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
                                        Log::insert_wallet($mentor_slot->slot_id,$income_mentors,"MENTORS_BONUS");
                                        Log::insert_earnings($mentor_slot->slot_id,$income_mentors,"MENTORS_BONUS","SLOT PLACEMENT",$slot_placement->slot_id,$details,$mentor_tree->sponsor_level);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    public static function mentors_bonus_check_cycle($slot_id,$date_pairing)
    {
        $slot_placement  = Tbl_slot::where("slot_id",$slot_id)->first();
        $total_earned    = 0;
        $binary_settings = Tbl_binary_settings::first();
        $balance         = Tbl_wallet_log::where("wallet_log_slot_id",$slot_id)->where("wallet_log_details","MENTORS BONUS");

        if($binary_settings->mentors_matching_cycle == 1)
        {
            $balance->where("wallet_log_date_created",">=",$date_pairing->format("Y-m-d 00:00:00"));

            $total_earned = $balance->sum("wallet_log_amount");
        }
        else if($binary_settings->mentors_matching_cycle == 2)
        {   
            $meridiem  = Carbon::parse($date_pairing)->format("A"); 
            if($meridiem == "AM")
            {   
                $date  = Carbon::parse($date_pairing)->format("Y-m-d 00:00:00");
            }
            else 
            {
                $date  = Carbon::parse($date_pairing)->format("Y-m-d 12:00:00");
            }
            $balance->where("wallet_log_date_created",">=",$date);

            $total_earned = $balance->sum("wallet_log_amount");
        }
        else if($binary_settings->mentors_matching_cycle == 3)
        {
            $date  = Carbon::parse($date_pairing)->startofweek();
            $balance->where("wallet_log_date_created",">=",$date);

            $total_earned = $balance->sum("wallet_log_amount");
        }
        


        return $total_earned;
    }
}