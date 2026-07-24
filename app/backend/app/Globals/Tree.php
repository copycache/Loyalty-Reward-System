<?php
namespace App\Globals;
use App\Models\Tbl_tree_sponsor;
use App\Models\Tbl_tree_placement;
use App\Models\Tbl_slot;


class Tree
{	
    public static function insert_tree_placement($slot_info, $new_slot, $level)
    { 
        if($slot_info != null)
        {
            $old_level   = $level;
            $upline_info = Tbl_slot::where("slot_id",$slot_info->slot_placement)->first();
            
            /*CHECK IF TREE IS ALREADY EXIST*/
            if($upline_info)
            {
                $check_if_exist = Tbl_tree_placement::where("placement_child_id",$new_slot->slot_id)
                ->where('placement_level', '=', $level)
                ->where('placement_parent_id', '=', $upline_info->slot_id)
                ->first();
            }
            else
            {
                $check_if_exist = Tbl_tree_placement::where("placement_child_id",$new_slot->slot_id)
                ->where('placement_level', '=', $level)
                ->first();
            }

            if($upline_info)
            {
                if($upline_info->slot_id != $new_slot->slot_id)
                {
                    if(!$check_if_exist)
                    {   
                        $insert["placement_parent_id"] = $upline_info->slot_id;
                        $insert["placement_child_id"] = $new_slot->slot_id;
                        $insert["placement_position"] = $slot_info->slot_position;
                        $insert["placement_level"] = $level;

                        if($level==1)
                        {
                            $insert["position_type"] = "OUTER";
                        } else {
                            $d = Tbl_tree_placement::where('placement_parent_id', $upline_info->slot_id)->where('placement_child_id', $new_slot->slot_placement)->first();
                            if($d)
                            {
                                if($d->position_type == "OUTER")
                                {
                                    if($d->placement_position == $new_slot->slot_position)
                                    {
                                        $insert["position_type"] = "OUTER";
                                    } else {
                                        $insert["position_type"] = "INNER";
                                    }
                                } else {
                                    $insert["position_type"] = "INNER";
                                }
                            }
                        }
                        Tbl_tree_placement::insert($insert);
                    }

                    $level++;
                    Tree::insert_tree_placement($upline_info, $new_slot, $level);
                } 
            }
        }
    }

    public static function insert_tree_sponsor($slot_info, $new_slot, $level)
    {

        if($slot_info != null)
        {
            $upline_info = Tbl_slot::where("slot_id",$slot_info->slot_sponsor)->first();
            /*CHECK IF TREE IS ALREADY EXIST*/
            $check_if_exist = null;
            if($upline_info)
            {
                $check_if_exist = Tbl_tree_sponsor::where("sponsor_child_id",$new_slot->slot_id)
                ->where('sponsor_parent_id', '=', $upline_info->slot_id )
                ->first();
            }
            else
            {
                $check_if_exist = Tbl_tree_sponsor::where("sponsor_child_id",$new_slot->slot_id)
                ->first();
            }

            if($upline_info)
            {
                    if($upline_info)
                    {
                        if($upline_info->slot_id != $new_slot->slot_id)
                        {
                            if(!$check_if_exist)
                            {                            
                            	$insert["sponsor_parent_id"] = $upline_info->slot_id;
                                $insert["sponsor_child_id"] = $new_slot->slot_id;
                                $insert["sponsor_level"] = $level;
                                Tbl_tree_sponsor::insert($insert);
                            }
                            $level++;
                            Tree::insert_tree_sponsor($upline_info, $new_slot, $level);  
                        }
                    }
            }
        }
    }
}