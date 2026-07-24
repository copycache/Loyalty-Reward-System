<?php
namespace App\Globals;

use App\Models\Tbl_dropshipping_bonus;
use App\Models\Tbl_dropshipping_bonus_logs;
use Carbon\Carbon;
use App\Globals\Log;

use App\Models\Tbl_slot;
use App\Models\Tbl_mlm_plan;
use App\Models\Tbl_item;
use App\Models\Tbl_currency;
use App\Models\Tbl_label;


use App\Globals\Mlm_complan_manager;



class MLM
{
	public static function entry($slot_info)
	{

	}

	public static function placement_entry($slot_id, $import = null,$membership_id = null)
	{
        $slot_info = Tbl_slot::where('slot_id', $slot_id)->where("slot_sponsor","!=","0")->first();
        if($slot_info)
        {
            if($membership_id != null)
            {
                $slot_info->slot_membership = $membership_id;
            }
            // Mlm Computation Plan
            $plan_settings = Tbl_mlm_plan::where('mlm_plan_enable', 1)
                                         ->where('mlm_plan_trigger', 'Slot Placement')
                                         ->get();
            
            if($slot_info->slot_type == 'PS')
            {
                foreach($plan_settings as $key => $value)
                {
                    $plan = strtolower($value->mlm_plan_code);
                    Mlm_complan_manager::$plan($slot_info);

                }
            }
            // End Computation Plan
            
        }
	}

	public static function create_entry($slot_id,$membership_id = null)
	{
        $slot_info = Tbl_slot::where('slot_id', $slot_id)->first();

        if($membership_id != null)
        {
            $slot_info->slot_membership = $membership_id;
        }
        // Mlm Computation Plan
        $plan_settings = Tbl_mlm_plan::where('mlm_plan_enable', 1)
                                     ->where('mlm_plan_trigger', 'Slot Creation')
                                     ->get();

        if($slot_info->slot_type == 'PS')
        {
            foreach($plan_settings as $key => $value)
            {
                $plan = strtolower($value->mlm_plan_code);
                $a = Mlm_complan_manager::$plan($slot_info);
            }
        }
        // End Computation Plan
	}

    public static function purchase($slot_id,$item_id)
    {
        $slot_info = Tbl_slot::where('slot_id', $slot_id)->first();
        // Mlm Computation Plan
        $plan_settings = Tbl_mlm_plan::where('mlm_plan_enable', 1)
                                     ->where('mlm_plan_trigger', 'Slot Repurchase')
                                     ->get();
        $item = Tbl_item::where("item_id",$item_id)->where("archived",0)->first(); 

        if($item)
        {
            $points       = $item->item_pv;
            $binary_pts   = $item->item_binary_pts;
        }
        else
        {
            $points       = 0;
            $binary_pts   = 0;
        }
        foreach ($plan_settings as $key => $value) {
            $plan = strtolower($value->mlm_plan_code);
            
            if ($plan === "binary_repurchase" && $binary_pts != 0) {
                $a = Mlm_complan_manager_repurchase::$plan($slot_info, $binary_pts);
            } elseif ($points != 0) {
                $a = Mlm_complan_manager_repurchase::$plan($slot_info, $points, $item_id);
            }
        }
        
    }
    
    public static function purchase_item($ordered_item, $slot_id, $subtotal = 0)
    {
        $orders = json_decode($ordered_item);
        $slot   = Tbl_slot::where('slot_id', $slot_id)->first();

        if (!$slot || !$orders) {
            return;
        }

        // If slot is inactive and has a sponsor product, process repurchase commissions
        if ($slot->membership_inactive == 1 && $slot->slot_sponsor_product != 0)
        {
            $slot_info = Tbl_slot::where('slot_id', $slot->slot_sponsor_product)->first();

            if ($slot_info)
            {
                foreach ($orders as $order)
                {
                    for ($qty = 1; $qty <= $order->quantity; $qty++)
                    {
                        Mlm_complan_manager_repurchase::repurchase_commission($slot_info, $slot_id, $order->item_id);
                    }
                }
            }
        }
        else
        {
            foreach ($orders as $order)
            {
                for ($qty = 1; $qty <= $order->quantity; $qty++)
                {
                    
                }
            }
        }
    }

    public static function dropshipping_purchase_item($ordered_item, $slot_id, $subtotal = 0, $order_id)
    {
        $orders = json_decode($ordered_item);

        foreach($orders as $key => $value)
        {
            for($qty = 1; $qty <= $value->quantity; $qty++)
            {
                Self::dropshipping_bonus($slot_id,$value->item_id,$order_id);
            }
        }
    }



    public static function dropshipping_bonus($slot_id,$item_id, $order_id) {
        $plan_status = Tbl_mlm_plan::where('mlm_plan_code','DROPSHIPPING_BONUS')->pluck('mlm_plan_enable')->first() ?? 0;
        if($plan_status == 1) {
            $check_if_product = Tbl_item::where('item_id',$item_id)->first();
            $plan_label = Tbl_label::where('plan_code','DROPSHIPPING_BONUS')->pluck('plan_name')->first();

            if($check_if_product->item_type == 'product')
            {
                $slot = Tbl_slot::where('slot_id',$slot_id)->where('membership_inactive',0)->first();

                if($slot)
                {
                    $currency_id = Tbl_currency::where('currency_default',1)->pluck('currency_id')->first();
                    $dropshipping_settings = Tbl_dropshipping_bonus::where('membership_id',$slot->slot_membership)->where('item_id',$item_id)->first();
                    if($dropshipping_settings)
                    {
                        if($dropshipping_settings->commission > 0)
                        {
                            $dropshipping_bonus = $dropshipping_settings->type == 'fixed' ? $dropshipping_settings->commission : ($dropshipping_settings->commission / 100) * $check_if_product->item_price;

                            $insert_log['slot_id'] = $slot_id;                       
                            $insert_log['membership_id'] = $slot->slot_membership;                            
                            $insert_log['item_id'] = $item_id;                    
                            $insert_log['order_id'] = $order_id;                    
                            $insert_log['commission'] = $dropshipping_bonus;                        
                            $insert_log['type'] = $dropshipping_settings->type ?? null;                       
                            $insert_log['date'] = Carbon::now(); 
                            Tbl_dropshipping_bonus_logs::insert($insert_log);
                            Log::insert_wallet($slot_id,$dropshipping_bonus,$plan_label,$currency_id);
                            Log::insert_earnings($slot_id,$dropshipping_bonus,"DROPSHIPPING_BONUS","SPECIAL PLAN",null,"",0,$currency_id);

                        }
                    }
                }
            }
        }
    }
}