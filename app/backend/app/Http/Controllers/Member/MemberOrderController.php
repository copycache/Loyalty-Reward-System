<?php
namespace App\Http\Controllers\Member;

use App\Globals\Item;
use App\Models\Cart;
use App\Models\Tbl_address;
use App\Models\Tbl_branch;
use App\Models\Tbl_receipt;
use App\Models\Tbl_slot;
use Carbon\Carbon;
use DB;
use Request;

class MemberOrderController extends MemberController
{
    public function get_orders()
    {
        $slot_id = Request::input('slot_id');
        $status = ['all', 'pending', 'delivered', 'completed', 'cancelled', 'pickup'];
        foreach ($status as $st => $stats) {
            $query = DB::table('tbl_orders')->where('buyer_slot_id', $slot_id)->where('order_from', 'ecommerce')->where('order_status', '!=', null)->orderBy('order_date_created', 'DESC');
            $orders[$stats] = $stats == 'all' ? $query->get() : $query->where('order_status', $stats)->get();
            $orders[$stats . '_count'] = count($orders[$stats]);
            foreach ($orders[$stats] as $key => $value) {
                $buyer = Tbl_slot::where('slot_id', $value->buyer_slot_id)->join('users', 'users.id', '=', 'tbl_slot.slot_owner')->first();
                $address = Tbl_address::Address()->where('user_id', $buyer->id)->where('is_default', 1)->first();
                $orders[$stats][$key]->order_number = sprintf("%08d", $value->order_id);
                $orders[$stats][$key]->buyer_info = $buyer;
                $orders[$stats][$key]->default_address = $address == null ? "INVALID" : $address;
                $orders[$stats][$key]->receipt = Tbl_receipt::where('receipt_id', $value->order_id)->first();
                $orders[$stats][$key]->order_date_created = date("F j, Y g:ia", strtotime($value->order_date_created));
                $orders[$stats][$key]->order_date_delivered = $value->order_date_delivered == null ? null : date("F j, Y g:ia", strtotime($value->order_date_delivered));
                $orders[$stats][$key]->receipt['branch_address'] = Tbl_branch::where('branch_id', $orders[$stats][$key]->receipt['retailer'])->pluck('branch_location')->first();

                $items = json_decode($value->items);
                foreach ($items as $key2 => $value2) {
                    $orders[$stats][$key]->item[$key2] = DB::table('tbl_item')->where('item_id', $value2->item_id)->first();
                    $orders[$stats][$key]->item[$key2]->item_price = $value2->discounted_price > 0 ? $value2->discounted_price : DB::table('tbl_item')->where('item_id', $value2->item_id)->first()->item_price;
                    $orders[$stats][$key]->item[$key2]->quantity = $value2->quantity;
                    $orders[$stats][$key]->item[$key2]->ratings = Item::get_ratings($value2->item_id, $buyer->id, sprintf("%08d", $value->order_id));
                }
            }
        }
        return response()->json($orders, 200);
    }
    public function claim_code_claimed()
    {
        $receipt_id = Request::input('receipt_id');
        $claim_code = Request::input('claim_code');
        $response = Self::select_claim_codes($receipt_id, $claim_code);
        return response()->json($response);
    }
    public static function select_claim_codes($receipt_id, $claim_code = null)
    {
        if (isset($claim_code)) {
            $check_receipt = Tbl_receipt::where('receipt_id', $receipt_id)->where('claimed', 0)->first();

            if ($check_receipt) {
                $update['claimed'] = 1;

                Tbl_receipt::where('receipt_id', $receipt_id)->update($update);

                $update2['order_status'] = "claimed";
                $update2['date_status_changed'] = Carbon::now();
                DB::table('tbl_orders')->where('order_id', $check_receipt->receipt_order_id)->update($update2);

                $return["status"] = "success";
                $return["status_code"] = 200;
                $return["status_message"] = "Order Received!";
            } else {
                $return["status"] = "error";
                $return["status_code"] = 400;
                $return["status_message"] = "Claim code either used or invalid!";
            }
        } else {
            $return = Tbl_receipt::where('receipt_id', $receipt_id)->first();

            $items = json_decode($return->items);

            foreach ($items as $key => $value) {
                $item[$key] = Tbl_item::where('item_id', $value->item_id)->select('item_sku')->first();
                $item[$key]->quantity = $value->quantity;
            }

            $return['items'] = $item;
        }

        return $return;
    }

    public function addToCart(Request $request)
    {
        try {

            $items = Request::input('checkout_items');

            foreach ($items as $item) {

                //check if already exists
                $record = Cart::where('item_sku', $item['item_sku'])->first();

                if ($record) {
                    $cart = Cart::where('item_sku', $item['item_sku'])->first();
                } else {
                    $cart = new Cart;
                }

                $cart->slot_owner = Request::input('slot_owner');
                $cart->archived = $item['archived'];
                $cart->bind_membership_id = $item['bind_membership_id'];
                $cart->code_user = $item['code_user'];
                $cart->discounted_price = $item['discounted_price'];
                $cart->inclusive_gc = $item['inclusive_gc'];
                $cart->inventory_branch_id = $item['inventory_branch_id'];
                $cart->inventory_id = $item['inventory_id'];
                $cart->inventory_item_id = $item['inventory_item_id'];
                $cart->inventory_quantity = $item['inventory_quantity'];
                $cart->inventory_sold = $item['inventory_sold'];
                $cart->inventory_status = $item['inventory_status'];
                $cart->inventory_total = $item['inventory_total'];
                $cart->is_kit_upgrade = $item['is_kit_upgrade'];
                $cart->item_availability = $item['item_availability'];
                $cart->item_barcode = $item['item_barcode'];
                $cart->item_category = $item['item_category'];
                $cart->item_date_created = $item['item_date_created'];
                $cart->item_description = $item['item_description'];
                $cart->item_gc_price = $item['item_gc_price'];
                $cart->item_id = $item['item_id'];
                $cart->item_inventory_id = $item['item_inventory_id'];
                $cart->item_price = $item['item_price'];
                $cart->item_pv = $item['item_pv'];
                $cart->item_qty = $item['item_qty'];
                $cart->item_sku = $item['item_sku'];
                $cart->item_sub_category = $item['item_sub_category'];
                $cart->item_thumbnail = $item['item_thumbnail'];
                $cart->item_type = $item['item_type'];
                $cart->membership_id = $item['membership_id'];
                $cart->product_id = $item['product_id'];
                $cart->qty_charged = $item['qty_charged'];
                $cart->slot_qty = $item['slot_qty'];
                $cart->tag_as = $item['tag_as'];
                $cart->upgrade_own = $item['upgrade_own'];
                $cart->item_charged = $item['item_charged'];


                if ($cart->save()) {
                    return response()->json($item);
                }
            }

        } catch (Exception $e) {
            return response()->json($e->getMessage());
        }

    }

    public function getCartItems()
    {
        $data = Request::input();
        $items = Cart::where('slot_owner', $data['slot_owner'])->leftjoin('tbl_branch','tbl_branch.branch_id','inventory_branch_id')->get();
        return response()->json($items);
    }

    public function deleteItem()
    {
        $item = Cart::where('id', Request::input('id'))->delete();
        return response()->json($item);
    }

    public function deleteAllItem()
    {
        $return = Cart::where('slot_owner', Request::input('slot_owner'))->delete();
        return response()->json($return);
    }

}
