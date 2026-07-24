<?php
namespace App\Globals;

use App\Globals\Audit_trail;
use App\Models\Cart;
use App\Models\Rel_item_kit;
use App\Models\Tbl_address;
use App\Models\Tbl_branch;
use App\Models\Tbl_cashier;
use App\Models\Tbl_cashier_bonus;
use App\Models\Tbl_cashier_bonus_settings;
use App\Models\Tbl_codes;
use App\Models\Tbl_currency;
use App\Models\Tbl_dropshipping_bonus;
use App\Models\Tbl_inventory;
use App\Models\Tbl_item;
use App\Models\Tbl_item_membership_discount;
use App\Models\Tbl_item_points;
use App\Models\Tbl_item_rating;
use App\Models\Tbl_item_stockist_discount;
use App\Models\Tbl_membership;
use App\Models\Tbl_mlm_unilevel_settings;
use App\Models\Tbl_product_category;
use App\Models\Tbl_product_subcategory;
use App\Models\Tbl_receipt;
use App\Models\Tbl_slot;
use App\Models\Tbl_unilevel_items;
use App\Models\Tbl_wallet;

use App\Models\Users;
use Carbon\Carbon;
use DB;
use Request;
use Validator;

class Item
{
    public static function add($data, $user = null)
    {
        $rules["item_sku"] = "required|unique:tbl_item";
        $rules["item_description"] = "required";
        $rules["item_barcode"] = "";
        $rules["item_price"] = "required|numeric|min:1";
        $rules["item_pv"] = "required|numeric";
        $rules["item_binary_pts"] = "required|numeric";
        $rules["item_type"] = "required";
        $rules["item_category"] = "required";
        $rules["tag_as"] = "required";

        if ($data["item_type"] == "membership_kit") {
            $rules["membership_id"] = "required";
            $rules["slot_qty"] = "required|numeric|min:1";
            $rules["inclusive_gc"] = "required|numeric|min:0";
        }

        $validator = Validator::make($data, $rules);
        if ($validator->fails()) {
            $return["status"] = "error";
            $return["status_code"] = 400;
            $return["status_message"] = $validator->messages()->all();
        } else {
            $count = Tbl_item::orderBy('item_id', 'desc')->first()->item_id;
            $insert["item_thumbnail"] = $data["item_thumbnail"];
            $insert["item_sku"] = $data["item_sku"];
            $insert["item_description"] = $data["item_description"];
            $insert["item_inclusion_details"] = $data["item_inclusion_details"];
            $insert["item_barcode"] = isset($data["item_barcode"]) ? $data["item_barcode"] : "";
            $insert["item_price"] = $data["item_price"];
            $insert["item_charged"] = $data["item_charged"] ?? 0;
            $insert["qty_charged"] = $data["qty_charged"] ?? 0;
            $insert["item_pv"] = $data["item_pv"];
            $insert["item_binary_pts"] = $data["item_binary_pts"];
            $insert["item_type"] = $data["item_type"];
            $insert["item_category"] = $data["item_category"];
            $insert["item_sub_category"] = $data["item_sub_category"];
            $insert["item_points_incetives"] = $data["item_points_incetives"];
            $insert["item_points_currency"] = $data["item_points_currency"];
            $insert["bind_membership_id"] = $data["item_type"] == "product" ? $data["bind_membership_id"] : 0;
            $insert["membership_id"] = $data["item_type"] == "membership_kit" ? $data["membership_id"] : 0;
            $insert["slot_qty"] = $data["item_type"] == "membership_kit" ? $data["slot_qty"] : 0;
            $insert["inclusive_gc"] = $data["item_type"] == "membership_kit" ? $data["inclusive_gc"] : 0;
            $insert["code_user"] = $data['code_user'] != null ? $data['code_user'] : "everyone";
            $insert["upgrade_own"] = $data['upgrade'] != null ? $data['upgrade'] : 0;
            $insert["is_kit_upgrade"] = $data['is_kit_upgrade'] != null ? $data['is_kit_upgrade'] : 0;
            $insert["tag_as"] = $data['tag_as'] ?? null;
            $insert["item_date_created"] = Carbon::now();
            $insert["product_id"] = "P" . str_pad($count + 1, 8, '0', STR_PAD_LEFT);

            $id = Tbl_item::insertGetId($insert);
            if ($data["item_type"] == "membership_kit") {
                $item_kit = $data["item_kit_fix"];
                if (count($item_kit) > 0) {
                    foreach ($item_kit as $key => $value) {
                        if ($value["item_inclusive_id"] != null && $value["item_qty"] != null) {
                            $insert_kit["item_id"] = $id;
                            $insert_kit["item_inclusive_id"] = $value["item_inclusive_id"];
                            $insert_kit["item_qty"] = $value["item_qty"];
                            Rel_item_kit::insert($insert_kit);
                        }
                    }
                    //audit trail new value item kit
                    $new_value['rel_item_kit'] = Rel_item_kit::where('item_id', $id)->get();
                    //end
                }
            } elseif ($data["item_type"] == "product") {
                $item_membership_discount = $data["item_membership_discount_fix"];
                if (count($item_membership_discount) > 0) {
                    foreach ($item_membership_discount as $key => $value) {
                        $insert_discount["membership_id"] = $value["membership_id"];
                        $insert_discount["item_id"] = $id;
                        // $insert_discount["discount"]      = $value["discount"] < 0 ? 0 : ($value["discount"] > 100 ? 100 : $value["discount"]);
                        $insert_discount["discount"] = $value["discount"];
                        Tbl_item_membership_discount::insert($insert_discount);
                    }
                    //audit trail new value item kit
                    $new_value['item_membership_discount'] = Tbl_item_membership_discount::where('item_id', $id)->get();
                    //end
                }

                // $item_membership_discount = $data["item_membership_discount_fix"];
                // if (count($item_membership_discount) > 0)
                // {
                //     foreach ($item_membership_discount as $key => $value)
                //     {
                //         $insert_discount["membership_id"]     = $value["membership_id"];
                //         $insert_discount["item_id"]           = $id;
                //         $insert_discount["commission"]      = 0;
                //         Tbl_item_membership_discount::insert($insert_discount);
                //     }
                //     //audit trail new value item kit
                //     $new_value['item_membership_discount'] = Tbl_item_membership_discount::where('item_id',$id)->get();
                //     //end
                // }
            }

            //tbl_inventory_item_id
            $check_null_items = Tbl_inventory::where('inventory_item_id', null)->get();

            if (count($check_null_items) == 0) {

                $table_inventory = Tbl_inventory::where('inventory_item_id', '!=', $id)->select('inventory_branch_id')->distinct()->get();
                foreach ($table_inventory as $key => $value) {
                    $insert_inventory['inventory_branch_id'] = $value->inventory_branch_id;
                    $insert_inventory['inventory_item_id'] = $id;
                    Tbl_inventory::insert($insert_inventory);
                }
                //audit trail new value inventory
                $new_value['inventory'] = Tbl_inventory::where('inventory_item_id', $id)->get();
                //end
            } else {
                foreach ($check_null_items as $key => $value) {
                    Tbl_inventory::where('inventory_id', $value->inventory_id)->update(['inventory_item_id' => $id]);
                }
                //audit trail new value inventory
                $new_value['inventory'] = Tbl_inventory::where('inventory_item_id', $id)->get();
                //end
            }

            $table_stockist_discount = Tbl_item_stockist_discount::where('item_id', '!=', $id)->select('stockist_level_id')->distinct()->get();
            foreach ($table_stockist_discount as $key => $value) {
                $insert_stockist_discount['stockist_level_id'] = $value->stockist_level_id;
                $insert_stockist_discount['item_id'] = $id;
                Tbl_item_stockist_discount::insert($insert_stockist_discount);
            }
            //audit trail new value stockist discount
            $new_value['item_stockist_discount'] = Tbl_item_stockist_discount::where('item_id', $id)->get();
            //end

            //audit trail new value
            $new_value['item'] = Tbl_item::where('item_id', $id)->first();
            //end
            if (isset($user)) {
                $action = 'Add Product';
                Audit_trail::audit(null, serialize($new_value), $user['id'], $action);
            }

            $return["status"] = "success";
            $return["status_code"] = 201;
            $return["status_message"] = "Item Created";
            $return["id"] = $id;
        }
        return $return;
    }
    public static function edit($data)
    {
        $rules["item_sku"] = "required";
        $rules["item_description"] = "required";
        $rules["item_barcode"] = "";
        $rules["item_price"] = "required|numeric|min:1";
        // $rules["item_gc_price"]        = "required|numeric|min:1";
        $rules["item_pv"] = "required|numeric";
        $rules["item_binary_pts"] = "required|numeric";
        $rules["item_type"] = "required";
        $rules["item_category"] = "required";
        $rules["tag_as"] = "required";
        $rules["item_category"] = "required";

        $action = 'edit Product';


        if ($data['item']["item_type"] == "membership_kit") {
            $rules["membership_id"] = "required";
            $rules["slot_qty"] = "required|numeric|min:1";
            $rules["inclusive_gc"] = "required|numeric";
        }
        $validator = Validator::make($data['item'], $rules);
        $check_landing_exist = Tbl_item::where('tag_as', 'landing')->first();
        if ($validator->fails()) {
            $return["status"] = "error";
            $return["status_code"] = 400;
            $return["status_message"] = $validator->messages()->all();
        } 
        else if(($check_landing_exist && $check_landing_exist->item_id != $data['item']['item_id']) && $data['item']['tag_as'] == 'landing') {
            $return["status"] = "error";
            $return["status_code"] = 400;
            $return["status_message"][0] = 'Only one product can tag as Landing Page';
        } else {
            $id = $data['item']['item_id'];
            //audit trail old value
            $old_value['item'] = Tbl_item::where("item_id", $id)->first();

            //end
            if ($data['item']["item_thumbnail"]) {
                $update["item_thumbnail"] = $data['item']["item_thumbnail"];
            }
            $update["item_sku"] = $data['item']["item_sku"];
            $update["item_description"] = $data['item']["item_description"];
            $update["item_inclusion_details"] = $data['item']["item_inclusion_details"];
            $update["item_barcode"] = isset($data['item']["item_barcode"]) ? $data['item']["item_barcode"] : "";
            $update["item_price"] = $data['item']["item_price"];
            $update["item_charged"] = $data['item']["item_charged"] ?? 0;
            $update["qty_charged"] = $data['item']["qty_charged"] ?? 0;
            $update["item_gc_price"] = $data['item']["item_gc_price"];
            $update["item_pv"] = $data['item']["item_pv"];
            $update["item_binary_pts"] = $data['item']["item_binary_pts"];
            $update["item_type"] = $data['item']["item_type"];
            $update["item_category"] = $data['item']["item_category"];
            $update["item_sub_category"] = $data['item']["item_sub_category"];
            $update["item_points_incetives"] = $data['item']["item_points_incetives"];
            $update["item_points_currency"] = $data['item']["item_points_currency"];
            $update["bind_membership_id"] = $data['item']["bind_membership_id"];
            $update["membership_id"] = $data['item']["item_type"] == "membership_kit" ? $data['item']["membership_id"] : 0;
            $update["slot_qty"] = $data['item']["item_type"] == "membership_kit" ? $data['item']["slot_qty"] : 0;
            $update["inclusive_gc"] = $data['item']["item_type"] == "membership_kit" ? $data['item']["inclusive_gc"] : 0;
            $update["code_user"] = $data['item']['code_user'] != null ? $data['item']['code_user'] : "everyone";
            $update["upgrade_own"] = $data['item']['upgrade'] != null ? $data['item']['upgrade'] : 0;
            $update["is_kit_upgrade"] = $data['item']['is_kit_upgrade'] != null ? $data['item']['is_kit_upgrade'] : 0;
            $update["item_availability"] = $data['item']['availability'];
            $update["tag_as"] = $data['item']['tag_as'];
            $update["item_date_created"] = Carbon::now();
            Tbl_item::where("tbl_item.item_id", $id)->update($update);

            // update the value in cart.
            unset($update['item_charged']);
            // $update['discounted_price'] = abs(Tbl_item_membership_discount::where('item_id', $id)->where('membership_id', $update["membership_id"])->pluck('discount')->first() - $update['item_price']);
            // Cart::where('item_id', $id)->update($update);
            Cart::where('item_id', $id)->delete();

            //audit trail new value
            $new_value['item'] = Tbl_item::where("item_id", $id)->first();
            //end
            if ($data['item']["item_type"] == "membership_kit") {
                //audit trail old value item kit
                $old_value['rel_item_kit'] = Rel_item_kit::where('item_id', $id)->get();
                //end
                Rel_item_kit::where("rel_item_kit.item_id", $id)->delete();
                $item_kit = $data['item']["item_kit_fix"];
                if (count($item_kit) > 0) {
                    foreach ($item_kit as $key => $value) {
                        $item_kit_rules["item_qty"] = "required|numeric|min:1";
                        $validator = Validator::make($value, $item_kit_rules);
                        if ($validator->fails()) {
                            $return["status"] = "error";
                            $return["status_code"] = 400;
                            $return["status_message"] = $validator->messages()->all();
                            return $return;
                        } else {
                            if ($value["item_inclusive_id"] != null && $value["item_qty"] != null) {
                                $insert_kit["item_id"] = $id;
                                $insert_kit["item_inclusive_id"] = $value["item_inclusive_id"];
                                $insert_kit["item_qty"] = $value["item_qty"];
                                Rel_item_kit::insert($insert_kit);
                            }
                        }
                    }
                    //audit trail new value item kit
                    $new_value['rel_item_kit'] = Rel_item_kit::where('item_id', $id)->get();
                    //end

                }

                //audit trail old value stockist discount
                $old_value['Tbl_item_stockist_discount'] = Tbl_item_stockist_discount::where('item_id', $id)->get();
                //end
                //stockist discount
                Tbl_item_stockist_discount::where("tbl_item_stockist_discount.item_id", $id)->delete();
                $item_stockist_discount = $data["stockist"];
                if (count($item_stockist_discount) > 0) {
                    foreach ($item_stockist_discount as $key => $value) {
                        if (isset($value["discount"]) && $value["discount"] == null) {
                            $value["discount"] = 0;
                        }
                        $insert_stockist_discount["stockist_level_id"] = $value["stockist_level_id"];
                        $insert_stockist_discount["item_id"] = $id;
                        $insert_stockist_discount["discount"] = $value["discount"] < 0 ? 0 : ($value["discount"] > 100 ? 100 : $value["discount"]);
                        Tbl_item_stockist_discount::insert($insert_stockist_discount);
                    }
                    //audit trail new value stockist discount
                    $new_value['Tbl_item_stockist_discount'] = Tbl_item_stockist_discount::where('item_id', $id)->get();
                    //end
                }
                //audit trail old value item kit
                $old_value['item_membership_discount'] = Tbl_item_membership_discount::where('item_id', $id)->get();
                //end
                //membership discounts
                Tbl_item_membership_discount::where("tbl_item_membership_discount.item_id", $id)->delete();
                $item_membership_discount = $data['item']["item_membership_discount_fix"];
                if (count($item_membership_discount) > 0) {
                    foreach ($item_membership_discount as $key => $value) {
                        $insert_discount["membership_id"] = $value["membership_id"];
                        $insert_discount["item_id"] = $id;
                        // $insert_discount["discount"]      = $value["discount"] < 0 ? 0 : ($value["discount"] > 100 ? 100 : $value["discount"]);
                        $insert_discount["discount"] = $value["discount"] ?? 0;
                        Tbl_item_membership_discount::insert($insert_discount);
                    }
                    //audit trail new value item kit
                    $new_value['item_membership_discount'] = Tbl_item_membership_discount::where('item_id', $id)->get();
                    //end
                }
            } elseif ($data['item']["item_type"] == "product") {
                //audit trail old value item kit
                $old_value_membership_discount['item_membership_discount'] = Tbl_item_membership_discount::where('item_id', $id)->get();
                //end
                Tbl_item_membership_discount::where("tbl_item_membership_discount.item_id", $id)->delete();
                $item_membership_discount = $data['item']["item_membership_discount_fix"];
                if (count($item_membership_discount) > 0) {

                    foreach ($item_membership_discount as $key => $value) {
                        $insert_discount["membership_id"] = $value["membership_id"];
                        $insert_discount["item_id"] = $id;
                        // $insert_discount["discount"]      = $value["discount"] < 0 ? 0 : ($value["discount"] > 100 ? 100 : $value["discount"]);
                        $insert_discount["discount"] = $value["discount"] ?? 0;
                        Tbl_item_membership_discount::insert($insert_discount);
                    }
                    //audit trail new value item kit
                    $new_value_membership_discount['item_membership_discount'] = Tbl_item_membership_discount::where('item_id', $id)->get();

                    Audit_trail::audit(serialize($old_value_membership_discount), serialize($new_value_membership_discount), $data['user']['id'], $action);

                    //end
                }

                //audit trail new value item kit
                $new_value_stockist_discount['item_stockist_discount'] = Tbl_item_stockist_discount::where('item_id', $id)->get();
                //end
                Tbl_item_stockist_discount::where("tbl_item_stockist_discount.item_id", $id)->delete();
                $item_stockist_discount = $data["stockist"];
                if (count($item_stockist_discount) > 0) {
                    $value["discount"] = $value["discount"] ?? 0;

                    foreach ($item_stockist_discount as $key => $value) {
                        $insert_stockist_discount["stockist_level_id"] = $value["stockist_level_id"];
                        $insert_stockist_discount["item_id"] = $id;
                        $insert_stockist_discount["discount"] = $value["discount"] < 0 ? 0 : ($value["discount"] > 100 ? 100 : $value["discount"]);
                        Tbl_item_stockist_discount::insert($insert_stockist_discount);
                    }
                    //audit trail new value item kit
                    $new_value_stockist_discount['item_stockist_discount'] = Tbl_item_stockist_discount::where('item_id', $id)->get();

                    Audit_trail::audit(serialize($new_value_stockist_discount), serialize($new_value_stockist_discount), $data['user']['id'], $action);

                    //end
                }

                //audit trail old value item kit
                $old_value_item_points['item_points'] = Tbl_item_points::where('item_id', $id)->get();
                //end
                Tbl_item_points::where("tbl_item_points.item_id", $id)->delete();
                $item_points = $data['item']["item_points_fix"];
                if (count($item_points) > 0) {
                    foreach ($item_points as $key => $value) {
                        $insert_points["item_points_key"] = $value["item_points_key"];
                        $insert_points["item_points_personal_pv"] = $value["item_points_personal_pv"];
                        $insert_points["item_points_group_pv"] = $value["item_points_group_pv"];
                        $insert_points["item_id"] = $id;
                        Tbl_item_points::insert($insert_points);
                    }
                    //audit trail old value item kit
                    $new_value_item_points['item_points'] = Tbl_item_points::where('item_id', $id)->get();

                    Audit_trail::audit(serialize($old_value_item_points), serialize($new_value_item_points), $data['user']['id'], $action);

                    //end
                }

                // DROPSHIPPING BONUS

                $old_value_personal_rebates['item_dropshipping_bonus'] = Tbl_dropshipping_bonus::where('item_id', $id)->get();
                Tbl_dropshipping_bonus::where("tbl_dropshipping_bonus.item_id", $id)->delete();
                $item_personal_rebates = $data['item']["item_dropshipping_bonus_fix"];

                if (count($item_personal_rebates) > 0) {
                    foreach ($item_personal_rebates as $key => $value) {
                        $personal_rebates["membership_id"] = $value["membership_id"];
                        $personal_rebates["item_id"] = $id;
                        $personal_rebates["commission"] = $value['commission'] ?? 0;
                        $personal_rebates["type"] = $value['type'] ?? null;
                        Tbl_dropshipping_bonus::insert($personal_rebates);
                    }
                    $new_value_personal_rebates['item_dropshipping_bonus'] = Tbl_dropshipping_bonus::where('item_id', $id)->get();

                    Audit_trail::audit(serialize($old_value_personal_rebates), serialize($new_value_personal_rebates), $data['user']['id'], $action);

                }
            }

            if (isset($data['user'])) {
                $action = 'edit Product';
                Audit_trail::audit(serialize($old_value), serialize($new_value), $data['user']['id'], $action);
            }

            $return["status"] = "success";
            $return["status_code"] = 201;
            $return["status_message"] = "Item Updated";
        }
        return $return;
    }
    public static function get_product()
    {
        return Tbl_item::where("tbl_item.archived", 0)->where("tbl_item.item_type", "product")->get();
    }
    public static function get_product_unilevel()
    {
        $products = Tbl_item::where("tbl_item.archived", 0)->where("tbl_item.item_type", "product")->get();
        $unilevel_id = Tbl_mlm_unilevel_settings::first()->mlm_unilevel_settings_id;
        foreach ($products as $key => $value) {
            $check = Tbl_unilevel_items::where("item_id", $value->item_id)->first();
            if (!$check) {
                $insert['unilevel_settings_id'] = $unilevel_id;
                $insert['item_id'] = $value->item_id;
                $insert['item_qty'] = 1;
                $insert['included'] = 0;
                Tbl_unilevel_items::insert($insert);
            }
        }
        $return = Tbl_unilevel_items::leftJoin("tbl_item", "tbl_item.item_id", "=", "tbl_unilevel_items.item_id")
            ->select('included', 'item_sku', 'item_qty', 'tbl_unilevel_items.item_id', 'tbl_unilevel_items_id')->get();
        return $return;
    }

    public static function save_product_unilevel($data)
    {
        // dd($data);
        foreach ($data as $key => $value) {
            // dd($value);
            $update["item_qty"] = $value['item_qty'];
            $update["included"] = $value['included'];
            Tbl_unilevel_items::where('item_id', $value['item_id'])->update($update);
        }
    }
    
    public static function get_item($filters = null, $limit = null, $branch_id = null, $cashier = null)
    {
        $data = DB::table('tbl_item')->leftjoin('tbl_product_category', 'tbl_product_category.id', 'tbl_item.item_category')->leftJoin('tbl_product_subcategory', 'tbl_product_subcategory.id', 'tbl_item.item_sub_category');
        if ($cashier) {
            $data = $data->where('item_availability', 'cashier')->orWhere('item_availability', 'all');
        }

        if (isset($filters["item_type"]) && $filters["item_type"] != "all") {
            if ($filters['item_type'] == "archived") {
                $data = $data->where('archived', 1);
            } else {
                $data = $data->where("item_type", $filters["item_type"]);
            }
        }

        if (isset($filters["item_category"]) && $filters["item_category"] != "all") {
            if ($filters['item_category'] == "item_category") {
                $data = $data->where('archived', 1);
            } else {
                $data = $data->where("item_category", $filters["item_category"]);
            }
        }

        if (isset($filters["item_category"]) && $filters["item_category"] != "all" && isset($filters["item_sub_category"]) && $filters["item_sub_category"] != "all") {
            if ($filters['item_sub_category'] == "item_sub_category") {
                $data = $data->where('archived', 1);
            } else {
                $data = $data->where("item_sub_category", $filters["item_sub_category"]);
            }
        }
        if (isset($filters["search_key"])) {
            $data = $data->where("item_sku", "like", "%" . $filters["search_key"] . "%");
        }

        if (isset($filters["item_type"]) && $filters["item_type"] != "archived") {
            $data = $data->where("archived", 0);
        }

        if ($limit) {
            $data = $data->paginate($limit);
        } else {
            $data = $data->get();
        }
        return $data;
    }
    public static function get_inventory($data)
    {
        $items = Tbl_item::Unarchived()->JoinInventory()->where('tbl_inventory.inventory_branch_id', $data['branch_id'])->get();
        foreach ($items as $key => $value) {
            $items[$key]->used_codes = Tbl_item::Unarchived()->JoinInventory()->JoinCodesInventory()->where('tbl_inventory.inventory_id', $value->inventory_id)->Used()->count();
            $items[$key]->sold_codes = Tbl_item::Unarchived()->JoinInventory()->JoinCodesInventory()->where('tbl_inventory.inventory_id', $value->inventory_id)->Sold()->count();
            $items[$key]->unclaimed = Tbl_receipt::join('tbl_receipt_rel_item', 'tbl_receipt_rel_item.rel_receipt_id', '=', 'tbl_receipt.receipt_id')->join('tbl_item', 'tbl_item.item_id', '=', 'tbl_receipt_rel_item.item_id')->where('retailer', $value->inventory_branch_id)->where('claimed', 0)->where('tbl_item.item_id', $value->item_id)->sum('quantity');
            $items[$key]->claimed = Tbl_receipt::join('tbl_receipt_rel_item', 'tbl_receipt_rel_item.rel_receipt_id', '=', 'tbl_receipt.receipt_id')->join('tbl_item', 'tbl_item.item_id', '=', 'tbl_receipt_rel_item.item_id')->where('retailer', $value->inventory_branch_id)->where('claimed', 1)->where('tbl_item.item_id', $value->item_id)->sum('quantity');

        }

        return $items;
    }

    public static function check_inventory($id)
    {
        $inventory = Tbl_inventory::where('inventory_item_id', $id)->get();
        foreach ($inventory as $key => $value) {
            $inventory_quantity = Tbl_codes::where('code_inventory_id', $value->inventory_id)->where('archived', 0)->where('code_sold', 0)->where('code_used', 0)->count();
            $update['inventory_quantity'] = $inventory_quantity;
            Tbl_inventory::where('inventory_id', $value->inventory_id)->update($update);
        }

        return 1;
    }

    public static function get_item_inventory($item_id)
    {
        $check = Self::check_inventory($item_id);

        $data = Tbl_item::Unarchived()->JoinInventory()->JoinBranch()
            ->where('tbl_inventory.inventory_item_id', $item_id)
            ->get();
        foreach ($data as $key => $value) {
            $data[$key]->used_codes = Tbl_item::Unarchived()->JoinInventory()->JoinCodesInventory()->where('tbl_inventory.inventory_id', $value->inventory_id)->Used()->count();
            $data[$key]->sold_codes = Tbl_item::Unarchived()->JoinInventory()->JoinCodesInventory()->where('tbl_inventory.inventory_id', $value->inventory_id)->Sold()->count();
            $data[$key]->unclaimed = Tbl_receipt::join('tbl_receipt_rel_item', 'tbl_receipt_rel_item.rel_receipt_id', '=', 'tbl_receipt.receipt_id')->join('tbl_item', 'tbl_item.item_id', '=', 'tbl_receipt_rel_item.item_id')->where('retailer', $value->inventory_branch_id)->where('claimed', 0)->where('tbl_item.item_id', $value->item_id)->sum('quantity');
            $data[$key]->claimed = Tbl_receipt::join('tbl_receipt_rel_item', 'tbl_receipt_rel_item.rel_receipt_id', '=', 'tbl_receipt.receipt_id')->join('tbl_item', 'tbl_item.item_id', '=', 'tbl_receipt_rel_item.item_id')->where('retailer', $value->inventory_branch_id)->where('claimed', 1)->where('tbl_item.item_id', $value->item_id)->sum('quantity');
        }

        return $data;
    }
    public static function get_data($id, $slot_id = null)
    {
        $slot_info = Tbl_slot::where('slot_id', $slot_id)->first();
        $membership = $slot_info->slot_membership ?? 0;
        $data = Tbl_item::where("tbl_item.item_id", $id)->first();
        if ($data) {
            $rel_item_kit = Rel_item_kit::select("rel_item_kit.item_id", "tbl_item.item_id", "rel_item_kit.item_inclusive_id", "rel_item_kit.item_qty")->where("rel_item_kit.item_id", $data->item_id)->leftJoin("tbl_item", "tbl_item.item_id", "=", "rel_item_kit.item_id")->get();

            if ($rel_item_kit && count($rel_item_kit) > 0) {
                $data->item_kit = $rel_item_kit;
            }

            $membership_discount = Tbl_item_membership_discount::where("tbl_item_membership_discount.item_id", $data->item_id)->get();
            if ($membership_discount && count($membership_discount) > 0) {
                $data->membership_discount = $membership_discount;
            }

            $item_points = Tbl_item_points::where("tbl_item_points.item_id", $data->item_id)->get();
            if ($item_points && count($item_points) > 0) {
                $data->item_points = $item_points;
            }

            $check_stockist_list = DB::table('tbl_stockist_level')->where('archive', 0)->join('tbl_item_stockist_discount', 'tbl_stockist_level.stockist_level_id', '=', 'tbl_item_stockist_discount.stockist_level_id')->where('tbl_item_stockist_discount.item_id', $id)->get();

            if (count($check_stockist_list) == 0) {
                $data->stockist_list = DB::table('tbl_stockist_level')->where('archive', 0)->get();
            } else {
                $data->stockist_list = $check_stockist_list;
            }

            $item_dropshipping_bonus = Tbl_dropshipping_bonus::where("item_id", $data->item_id)->get();
            if ($item_dropshipping_bonus && count($item_dropshipping_bonus) > 0) {
                $data->item_dropshipping_bonus = $item_dropshipping_bonus;
            } else {
                $data->item_dropshipping_bonus = Tbl_membership::where('archive', 0)->get();
            }

            // $data->discounted_price = abs((Tbl_item_membership_discount::where('item_id',$data->item_id)->where('membership_id',$membership)->pluck('discount')->first() /100 )* $data->item_price - $data->item_price);
            $data->discounted_price = abs(Tbl_item_membership_discount::where('item_id', $data->item_id)->where('membership_id', $membership)->pluck('discount')->first() - $data->item_price);
            $data->item_ratings = Self::get_ratings($id);
        }
        return $data;
    }
    public static function archive($id, $user)
    {
        //audit trail old value
        $old_value = Tbl_item::where("tbl_item.item_id", $id)->first();
        //end
        Tbl_item::where("tbl_item.item_id", $id)->update(["archived" => 1]);
        //audit trail new value
        $new_value = Tbl_item::where("tbl_item.item_id", $id)->first();
        //end
        $action = 'Archived Item';
        Audit_trail::audit(serialize($old_value), serialize($new_value), $user['id'], $action);

        $return["status"] = "success";
        $return["status_code"] = 200;
        $return["status_message"] = "Item Archived";
        return $return;
    }

    public static function unarchive($id, $user)
    {
        //audit trail old value
        $old_value = Tbl_item::where("tbl_item.item_id", $id)->first();
        //end
        Tbl_item::where("tbl_item.item_id", $id)->update(["archived" => 0]);
        //audit trail new value
        $new_value = Tbl_item::where("tbl_item.item_id", $id)->first();
        //end
        $action = 'Archived Item';
        Audit_trail::audit(serialize($old_value), serialize($new_value), $user['id'], $action);

        $return["status"] = "success";
        $return["status_code"] = 200;
        $return["status_message"] = "Item Restored";
        return $return;
    }

    public static function restock($data)
    {
        $update['inventory_quantity'] = $data['quantity'];
        $query = Tbl_inventory::where([['inventory_branch_id', '=', $data['branch_id']], ['inventory_item_id', '=', $data['item_id']]])->first();

        if ($query->inventory_quantity == null) {
            Tbl_inventory::where([['inventory_branch_id', '=', $data['branch_id']], ['inventory_item_id', '=', $data['item_id']]])->update($update);
            $return["status"] = "success";
            $return["status_code"] = 200;
            $return["status_message"] = "Item Archived";
            return $return;
        } else {
            $update['inventory_quantity'] = $query->inventory_quantity + $data['quantity'];
            Tbl_inventory::where([['inventory_branch_id', '=', $data['branch_id']], ['inventory_item_id', '=', $data['item_id']]])->update($update);
            $return["branch_id"] = $data['branch_id'];
            $return["status"] = "success";
            $return["status_code"] = 200;
            $return["status_message"] = "Item Archived";
            return $return;
        }
    }
    public static function update_inventory($branch_id, $item_id, $quantity)
    {
        $current_quantity = Tbl_inventory::where([['inventory_branch_id', $branch_id], ['inventory_item_id', $item_id]])->sum('inventory_quantity');

        $update_quantity = $current_quantity + $quantity;
        Tbl_inventory::where([['inventory_branch_id', $branch_id], ['inventory_item_id', $item_id]])->update(['inventory_quantity' => $update_quantity]);
        $return["status"] = "success";
        $return["status_code"] = 200;
        $return["status_message"] = "Updated Successfully!";

        return $return;
    }
    public static function get_all_products($slot_id = null, $filter = null)
    {
        $slot_info = Tbl_slot::where('slot_id', $slot_id)->first();
        $membership = $slot_info->slot_membership ?? 0;
        if ($filter['item_type'] == "product") {
            if($membership) {
                $return = Tbl_item::where('archived', 0)->where('item_type', 'product')->where('item_availability', '!=', 'cashier')
                ->where(function ($query) use ($membership) {
                    $query->where('bind_membership_id', $membership)
                        ->orwhere('bind_membership_id', 0)
                        ->orwhere('bind_membership_id', -1);
                })->join('tbl_inventory', 'tbl_item.item_id', '=', 'tbl_inventory.inventory_item_id')->where('inventory_quantity', '!=', 0);
            } else {
                $return = Tbl_item::where('archived', 0)->where('item_type', 'product')->where('item_availability', '!=', 'cashier')
                ->where(function ($query) use ($membership) {
                    $query->where('bind_membership_id', $membership)
                        ->orwhere('bind_membership_id', 0);
                })->join('tbl_inventory', 'tbl_item.item_id', '=', 'tbl_inventory.inventory_item_id')->where('inventory_quantity', '!=', 0);
            }
            if (isset($filter["branch"])) {
                $return = $return->where("tbl_inventory.inventory_branch_id", $filter["branch"]);
            }
            if (isset($filter["search"])) {
                $return = $return->where("item_sku", "like", "%" . $filter["search"] . "%");
            }
            if (isset($filter["item_category"])) {
                if ($filter["item_category"] != 'all') {
                    $return = $return->where("item_category", $filter["item_category"]);
                }
            }
            if (isset($filter["item_sub_category"])) {
                if ($filter["item_sub_category"] != 'all') {
                    $return = $return->where("item_sub_category", $filter["item_sub_category"]);
                }
            }
            // if($check_product_sharelink != 0)
            // {
            //     $return = $return->where("item_id",$check_product_sharelink);
            // }
            $return = $return->paginate(8);
            foreach ($return as $key => $value) {
                // $value['discounted_price'] = abs(Tbl_item_membership_discount::where('item_id', $value->item_id)->where('membership_id', $membership)->pluck('discount')->first() - $value->item_price);
                $discount = Tbl_item_membership_discount::where('item_id', $value->item_id)->where('membership_id', $membership)->pluck('discount')->first();
                $discount_type = "fixed"; // change it to percentage if client want to percentage basis
                if($discount_type == "fixed")
                {
                    $value['discounted_price'] = abs($discount - $value->item_price);
                }
                elseif ($discount_type == "percentage")
                {
                    $value['discounted_price'] = abs(($discount / 100) * $value->item_price - $value->item_price);
                }
            }

        } else {
            if($membership) {
                $return = Tbl_item::where('archived', 0)->where('item_type', 'membership_kit')->where('item_availability', '!=', 'cashier')
                ->where(function ($query) use ($membership) {
                    $query->where('bind_membership_id', $membership)
                        ->orwhere('bind_membership_id', 0)
                        ->orwhere('bind_membership_id', -1);
                })->join('tbl_inventory', 'tbl_item.item_id', '=', 'tbl_inventory.inventory_item_id')->where('inventory_quantity', '!=', 0);
            } else {
                $return = Tbl_item::where('archived', 0)->where('item_type', 'membership_kit')->where('item_availability', '!=', 'cashier')
                ->where(function ($query) use ($membership) {
                    $query->where('bind_membership_id', $membership)
                        ->orwhere('bind_membership_id', 0);
                })->join('tbl_inventory', 'tbl_item.item_id', '=', 'tbl_inventory.inventory_item_id')->where('inventory_quantity', '!=', 0);
            }
            if (isset($filter["branch"])) {
                $return = $return->where("tbl_inventory.inventory_branch_id", $filter["branch"]);
            }
            if (isset($filter["search"])) {
                $return = $return->where("item_sku", "like", "%" . $filter["search"] . "%");
            }
            if (isset($filter["item_category"])) {
                if ($filter["item_category"] != 'all') {
                    $return = $return->where("item_category", "like", "%" . $filter["item_category"] . "%");
                }
            }
            if (isset($filter["item_sub_category"])) {
                if ($filter["item_sub_category"] != 'all') {
                    $return = $return->where("item_sub_category", "like", "%" . $filter["item_sub_category"] . "%");
                }
            }
            $return = $return->paginate(8);
            foreach ($return as $key => $value) {
                // $value['discounted_price'] = abs((Tbl_item_membership_discount::where('item_id',$value->item_id)->where('membership_id',$membership)->pluck('discount')->first() /100 ) * $value->item_price - $value->item_price);
                // $value['discounted_price'] = abs(Tbl_item_membership_discount::where('item_id', $value->item_id)->where('membership_id', $membership)->pluck('discount')->first() - $value->item_price);
                $discount = Tbl_item_membership_discount::where('item_id', $value->item_id)->where('membership_id', $membership)->pluck('discount')->first();
                $discount_type = "fixed";  // change it to percentage if client want to percentage basis
                if($discount_type == "fixed")
                {
                    $value['discounted_price'] = abs($discount - $value->item_price);
                }
                elseif ($discount_type == "percentage")
                {
                    $value['discounted_price'] = abs(($discount / 100) * $value->item_price - $value->item_price);
                }
            }
        }

        return $return;
    }
    public static function get_membership_kit()
    {
        $return = Tbl_item::where('archived', 0)->where('item_type', 'membership_kit')->get();

        return $return;
    }

    public static function get_cart($data, $branch_id = null)
    {
        $slot_info = Tbl_slot::where('slot_id', $data['slot_id'])->first();
        $membership = $slot_info->slot_membership ?? 0;
        $get_item_discount = null;

        $get_address = Tbl_address::where('user_id', Request::user()->id)->where('is_default', 1)->first();

        if ($get_address) {
            if ($get_address->regCode == 13) {
                $island_group = 1;
            } else {
                $island_group = $get_address->island_group;
            }
        }
        $return = [];
        $test = collect($data['items']);
        $unique = $test->unique()->values()->all();

        foreach ($unique as $key => $value) {
            if ($branch_id == null) {
                $branch_id = Tbl_branch::where('archived', 0)->pluck('branch_id')->first();
                $return[$key] = Tbl_item::where('tbl_item.archived', 0)->join('tbl_inventory', 'tbl_item.item_id', '=', 'tbl_inventory.inventory_item_id')->where('item_id', $value)->where('tbl_inventory.inventory_branch_id', $branch_id)
                    ->leftjoin('tbl_branch', 'tbl_branch.branch_id', 'tbl_inventory.inventory_branch_id')
                    ->first();
            } else {
                $return[$key] = Tbl_item::where('tbl_item.archived', 0)->join('tbl_inventory', 'tbl_item.item_id', '=', 'tbl_inventory.inventory_item_id')->where('item_id', $value)->where('tbl_inventory.inventory_branch_id', $branch_id)
                    ->leftjoin('tbl_branch', 'tbl_branch.branch_id', 'tbl_inventory.inventory_branch_id')
                    ->first();
            }

            $return[$key]->item_qty = 1;

        }
        /*CHECKING DUPLICATE*/
        $item_id = array();
        foreach ($return as $key => $value) {
            if (!in_array($value['item_id'], $item_id)) {
                $item_id[] = [$value['item_id'] => $value['item_qty']];
            } else {
                unset($return[$key]);
            }
        }
        foreach ($return as $key => $value) {

            $value['discounted_price'] = abs(Tbl_item_membership_discount::where('item_id', $value->item_id)->where('membership_id', $membership)->pluck('discount')->first() - $value->item_price);
        }

        return $return;
    }

    public static function get_landing_cart($data, $branch_id = null)
    {
        $test = collect($data['items']);
        $return = [];
        if($test) {
            $unique = $test->unique()->values()->all();

            foreach ($unique as $key => $value) {
                if ($branch_id == null) {
                    $branch_id = Tbl_branch::where('archived', 0)->pluck('branch_id')->first();
                    $return[$key] = Tbl_item::where('tbl_item.archived', 0)->join('tbl_inventory', 'tbl_item.item_id', '=', 'tbl_inventory.inventory_item_id')->where('item_id', $value)->where('tbl_inventory.inventory_branch_id', $branch_id)
                        ->leftjoin('tbl_branch', 'tbl_branch.branch_id', 'tbl_inventory.inventory_branch_id')
                        ->first();
                } else {
                    $return[$key] = Tbl_item::where('tbl_item.archived', 0)->join('tbl_inventory', 'tbl_item.item_id', '=', 'tbl_inventory.inventory_item_id')->where('item_id', $value)->where('tbl_inventory.inventory_branch_id', $branch_id)
                        ->leftjoin('tbl_branch', 'tbl_branch.branch_id', 'tbl_inventory.inventory_branch_id')
                        ->first();
                }
    
                $return[$key]->item_qty = 1;
    
            }
            /*CHECKING DUPLICATE*/
            $item_id = array();
            foreach ($return as $key => $value) {
                if (!in_array($value['item_id'], $item_id)) {
                    $item_id[] = [$value['item_id'] => $value['item_qty']];
                } else {
                    unset($return[$key]);
                }
            }
    
        }
        return $return;
       
    }

    public static function cashier_sale($payment, $item, $slot, $picked_up, $vat = 0, $manager_discount = 0, $remarks = null)
    {
        $cash_payment = 0;
        $cheque_payment = 0;
        $gc_payment = 0;
        $wallet_payment = 0;
        $payable = 0;
        $subtotal = 0;
        $grand_total = 0;
        $buying_currency = Tbl_currency::where('currency_buying', 1)->select('currency_id')->first();
        //payment is $requested
        if ($payment) {
            if ($payment[0]['method'] == 'cash') {
                $cash_payment = $cash_payment + $payment[0]['amount'];
                $payment_method = DB::table('tbl_cashier_payment_method')->where('cashier_payment_method_name', 'Cash')->first();
            } elseif ($payment[0]['method'] == 'cheque') {
                $cheque_payment = $cheque_payment + $payment[0]['amount'];
                $payment_method = DB::table('tbl_cashier_payment_method')->where('cashier_payment_method_name', 'Cheque')->first();

            } elseif ($payment[0]['method'] == 'gc') {
                $gc_payment = $gc_payment + $payment[0]['amount'];
                $payment_method = DB::table('tbl_cashier_payment_method')->where('cashier_payment_method_name', 'GC')->first();
            } else {
                $wallet_payment = $wallet_payment + $payment[0]['amount'];
                $payment_method = DB::table('tbl_cashier_payment_method')->where('cashier_payment_method_name', 'Wallet')->first();
            }

            //ordered items = $order
            foreach ($item as $key => $value) {
                $order[$key] = Tbl_item::where('item_id', $value['item_id'])->first();
                $order_item[$key]['item_id'] = $value['item_id'];
                $order[$key]->quantity = $value['item_qty'];
                $order_item[$key]['quantity'] = $value['item_qty'];

                $grand_total += $value['discounted_price'] * $value['item_qty'];
            }
            //customer is $customer
            $customer = Tbl_slot::where('slot_no', '=', $slot['slot_no'])->first();
            // checking payments
            $gc_currency_id = Tbl_currency::where('currency_name', 'Gift Card')->select('currency_id')->first();
            $gc_owned = Tbl_wallet::where([['slot_id', '=', $customer->slot_id], ['currency_id', '=', $gc_currency_id->currency_id]])->first();
            $wallet_owned = Tbl_wallet::where([['slot_id', '=', $customer->slot_id], ['currency_id', '=', $buying_currency->currency_id]])->first();
            $from = Request::user()->type;

            // make sure wallet rows exist before accessing ->wallet_amount
            if ($gc_owned && $wallet_owned && $gc_owned->wallet_amount >= $gc_payment && $wallet_owned->wallet_amount >= $wallet_payment) {
                //check discounts
                foreach ($order as $key => $value) {
                    $item[$key] = Tbl_item::where('item_id', $value->item_id)->first();
                    $item['discount'][$key] = Cashier::get_customer_discount($customer->slot_id, $value->item_id);
                    $item['discount'][$key]['original_price'] = $item[$key]['item_price'];
                    if ($item['discount'][$key]['percentage'] == 0) {
                        $discount = 'none';
                        if ($gc_payment > 0) {
                            $item_price = $item[$key]['item_gc_price'] * $value->quantity;
                            if ($item_price == 0) {
                                $return["status"] = "error";
                                $return["status_code"] = 420;
                                $return["status_message"] = "You cannot sell an Item through GC that has no GC Price set.";
                            }
                        } else {
                            $item_price = $item[$key]['item_price'] * $value->quantity;
                        }
                    } else {
                        $discount_to_deduct = $item[$key]['item_price'] * ($item['discount'][$key]['percentage'] / 100);
                        $item_price = ($item[$key]['item_price'] - $discount_to_deduct) * $value->quantity;
                        if ($gc_payment > 0) {
                            //no discount
                            $item_price = $item[$key]['item_gc_price'] * $value->quantity;
                            if ($item_price == 0) {
                                $return["status"] = "error";
                                $return["status_code"] = 420;
                                $return["status_message"] = "You cannot sell an Item through GC that has no GC Price set.";
                            }
                        } else {
                            $item_price = ($item[$key]['item_price'] - $discount_to_deduct) * $value->quantity;
                        }

                    }
                    $payable = $payable + $item_price;
                    if ($from == "stockist") {
                        $check_buyer = Tbl_slot::where('slot_id', $customer->slot_id)->first()->slot_owner;
                        $buyer_user_info = Users::where('id', $check_buyer)->first();
                        if ($buyer_user_info->type == 'stockist') {
                            //no discount
                            $item_price = $item[$key]['item_gc_price'] * $value->quantity;
                            if ($item_price == 0) {
                                $return["status"] = "error";
                                $return["status_code"] = 420;
                                $return["status_message"] = "You cannot sell an Item through GC that has no GC Price set.";
                            }
                        } else {
                            $item_price = ($item[$key]['item_price'] - $discount_to_deduct) * $value->quantity;
                        }

                    }
                }

                $combined_payment = $wallet_payment + $gc_payment + $cheque_payment + $cash_payment;

                $manager_discount_amount = 0;
                if ($manager_discount > 0) {
                    $manager_discount_amount = $payable * ($manager_discount / 100);
                }

                $vat_amount = 0;
                if ($vat == 1) {
                    $vat_amount = ($payable - $manager_discount_amount) * 0.12;
                }
                $payable = $vat_amount + $payable - $manager_discount_amount;
                $payment_change = ($combined_payment - $payable);
                if ($payment_change >= 0) {

                    if ($wallet_payment > 0) {
                        Log::insert_wallet($customer->slot_id, ($wallet_payment * -1), "cashier", $buying_currency->currency_id);

                        //---------------------------------Cashier bonus Enable------------------------------------------
                        $total_wallet_payment = $wallet_payment - $payment_change;
                        $check_cashier_bonus = Tbl_cashier_bonus_settings::first() ? Tbl_cashier_bonus_settings::first()->cashier_bonus_enable : 0;
                        if ($check_cashier_bonus != 0) {
                            $cashier_bonus = Tbl_cashier_bonus::where("archive", 0)->orderBy("cashier_bonus_buy_amount", "Desc")->get();
                            if (count($cashier_bonus) != 0) {
                                foreach ($cashier_bonus as $key => $bonus) {
                                    if ($total_wallet_payment >= $bonus["cashier_bonus_buy_amount"]) {
                                        Log::insert_wallet($customer->slot_id, $bonus["cashier_bonus_given_amount"], "cashier", $gc_currency_id->currency_id);
                                        break;
                                    }
                                }
                            }
                        }
                        //--------------------------------------------------------------------------------------
                    }
                    if ($gc_payment > 0) {
                        Log::insert_wallet($customer->slot_id, ($payable * -1), "cashier", $gc_currency_id->currency_id);
                    }
                    if ($cash_payment > 0) {

                        //---------------------------------Cashier bonus Enable------------------------------------------
                        $total_cash_payment = $cash_payment - $payment_change;
                        $check_cashier_bonus = Tbl_cashier_bonus_settings::first() ? Tbl_cashier_bonus_settings::first()->cashier_bonus_enable : 0;
                        if ($check_cashier_bonus != 0) {
                            $cashier_bonus = Tbl_cashier_bonus::where("archive", 0)->orderBy("cashier_bonus_buy_amount", "Desc")->get();
                            if (count($cashier_bonus) != 0) {
                                foreach ($cashier_bonus as $key => $bonus) {
                                    if ($total_cash_payment >= $bonus["cashier_bonus_buy_amount"]) {
                                        Log::insert_wallet($customer->slot_id, $bonus["cashier_bonus_given_amount"], "cashier", $gc_currency_id->currency_id);
                                        break;
                                    }
                                }
                            }
                        }
                        //--------------------------------------------------------------------------------------

                    }

                    $ordered_item = json_encode($order_item);
                    $vat = $vat;
                    $buyer_slot_id = $customer->slot_id;
                    $cashier_user_id = Request::user()->id;

                    // UPDATED: call create_order with new signature (removed dragonpay/voucher params)
                    // param order: items, vat, buyer_slot_id, cashier_user_id, from, delivery_method,
                    // picked_up, change, manager_discount, remarks, address, cashier_method, payment_given,
                    // shipping_fee_v2, handling_fee, checkout_total, receiver_name, receiver_email, receiver_contact_number
                    $return = Cashier::create_order(
                        $ordered_item,
                        $vat,
                        $buyer_slot_id,
                        $cashier_user_id,
                        $from,
                        'none',
                        $picked_up,
                        $payment_change,
                        $manager_discount,
                        $remarks,
                        null,
                        $payment_method->cashier_payment_method_id,
                        $combined_payment,
                        0,
                        0,
                        $grand_total,
                        null,
                        null,
                        null
                    );
                } else {
                    $return["status"] = "error";
                    $return["status_code"] = 400;
                    $return["status_message"] = "Insufficient Payment.";
                }
            } else {
                $return["status"] = "error";
                $return["status_code"] = 400;
                $return["status_message"] = "Insufficient Wallet/GC!";
            }
        } else {
            $return["status"] = "error";
            $return["status_code"] = 400;
            $return["status_message"] = "Please add payment!";
        }

        return $return;
    }

    public static function recount_inventory()
    {
        $check_user = Users::where('id', Request::user()->id)->first();
        if ($check_user->type == "cashier") {
            $cashier = Tbl_cashier::where('cashier_user_id', $check_user->id)->first();
            $inventory = Tbl_inventory::where('inventory_branch_id', $cashier->cashier_branch_id)->get();
        } else {
            $stockist = DB::table('tbl_stockist')->where('stockist_user_id', $check_user->id)->first();
            $inventory = Tbl_inventory::where('inventory_branch_id', $stockist->stockist_branch_id)->get();
        }
        foreach ($inventory as $key => $value) {
            $available_count = Tbl_codes::where('code_inventory_id', $value->inventory_id)
                ->where('code_sold', 0)
                ->where('code_used', 0)
                ->where('archived', 0)
                ->whereNull('kit_requirement')
                ->count();
            $sold_count = Tbl_codes::where('code_inventory_id', $value->inventory_id)->where('code_sold', 1)->count();
            $total = Tbl_codes::where('code_inventory_id', $value->inventory_id)->count();
            $update['inventory_quantity'] = $available_count;
            $update['inventory_sold'] = $sold_count;
            $update['inventory_total'] = $total;

            Tbl_inventory::where('inventory_id', $value->inventory_id)->update($update);
        }

        $data = 1;
        return $data;
    }

    public static function rate_item($item_rate, $item_id, $user_id, $item_review, $order_number)
    {
        // dd(12342134);
        $query = Tbl_item_rating::where('item_id', $item_id)->where("item_rate_order_number", $order_number)->where('user_id', $user_id)->first();
        $data['item_rate'] = $item_rate;
        $data['item_id'] = $item_id;
        $data['user_id'] = $user_id;
        $data['item_review'] = $item_review;
        $data['item_rate_order_number'] = $order_number;
        $data['item_rate_created'] = Carbon::now();
        if ($item_review != "") {
            $data['item_is_disabled'] = 1;
        }
        if ($query) {
            Tbl_item_rating::where('item_id', $item_id)->where("item_rate_order_number", $order_number)->where('user_id', $user_id)->update($data);
        } else {
            Tbl_item_rating::insert($data);
        }

        return Self::get_ratings($item_id, $user_id, $order_number);
    }

    public static function get_ratings($item_id = null, $user_id = null, $order_number = null)
    {
        if ($item_id != null && $user_id == null) {
            $array = Tbl_item_rating::where('item_id', $item_id);

            $data['rating_sum'] = $array->count() == 0 ? 0 : $array->sum('item_rate');
            $data['rating_list'] = $array->count() == 0 ? 0 : $array->MemberRatings()->get();
            $data['rating_count'] = $array->count() == 0 ? 0 : $array->count();
            $data['rating_average'] = $array->count() == 0 ? 0 : round($data['rating_sum'] / $data['rating_count']);

            $query = $data;
        } else {
            $query = Tbl_item_rating::where('item_id', $item_id)->where("item_rate_order_number", $order_number)->where('user_id', $user_id)->first();

            if (!$query) {
                $data['item_rate'] = 0;
                $data['item_id'] = $item_id;
                $data['user_id'] = $user_id;
                $data['item_review'] = "";
                $data['item_rate_order_number'] = null;
                $data['item_is_disabled'] = 0;
                $query = $data;
            }

        }

        return $query;
    }
    public static function get_currency()
    {
        return Tbl_currency::where('archive', 0)->get();
    }

    public static function check_rel_item_kit($item_id, $branch_id)
    {
        $max_code = 1000;
        $rel_item_kit = Rel_item_kit::where('rel_item_kit.item_id', $item_id)->join('tbl_item', 'tbl_item.item_id', '=', 'rel_item_kit.item_inclusive_id')->get();

        if (count($rel_item_kit) > 0) {

            foreach ($rel_item_kit as $key => $rel_kit) {
                $rel_item_kit[$key]->inventory_quantity = Tbl_inventory::where('inventory_item_id', $rel_kit->item_inclusive_id)->where('inventory_branch_id', $branch_id)->value('inventory_quantity');
                $rel_item_kit[$key]->maximum_codes = $rel_item_kit[$key]->inventory_quantity / $rel_kit->item_qty;
                if ($rel_item_kit[$key]->maximum_codes < $max_code) {
                    $max_code = $rel_item_kit[$key]->maximum_codes;
                }
            }
        }
        $data['max_code'] = $max_code;
        $data['rel_item_kit'] = $rel_item_kit;
        return $data;
    }
    public static function load_island_group()
    {
        $response = Tbl_island_group::get();

        return $response;
    }

    public static function get_category_list()
    {
        $response = Tbl_product_category::where('archive', 0)->get();
        return $response;
    }
    public static function get_subcategory_list($category_id = null)
    {
        $response = Tbl_product_subcategory::where('category_id', $category_id)->where('archive', 0)->get();

        return $response;
    }
    public static function highest_membership_list()
    {
        $return['highest_membership'] = Tbl_membership::where('archive', 0)->orderBy('hierarchy', 'DESC')->pluck('membership_id')->first();

        if ($return['highest_membership']) {
            $return['second_highest_membership'] = Tbl_membership::where('archive', 0)->where('membership_id', '!=', $return['highest_membership'])->orderBy('hierarchy', 'DESC')->pluck('membership_id')->first();
        } else {
            $return['second_highest_membership'] = Tbl_membership::where('archive', 0)->orderBy('hierarchy', 'DESC')->pluck('membership_id')->first();
        }

        return $return;
    }

}
