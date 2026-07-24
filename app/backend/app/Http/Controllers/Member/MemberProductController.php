<?php
namespace App\Http\Controllers\Member;

use App\Globals\Item;
use App\Globals\Cashier;
use App\Globals\Branch;
use App\Globals\Product;
use App\Globals\Cart;
use Request;
use Carbon\Carbon;
use DB;

use App\Models\Tbl_slot;
use App\Models\Tbl_unilevel_points;
use App\Models\Tbl_item;
use App\Models\Tbl_wallet;
use App\Models\Tbl_currency;
use App\Models\Tbl_product_category;
use App\Models\Tbl_product_subcategory;
use App\Models\Tbl_branch;
use App\Models\Tbl_cashier_payment_method;
use Crypt;


class MemberProductController extends MemberController
{
    public function get_front_cart()
    {
        $response = Cart::get_cart(Request::input('cart_key'));
        foreach ($response as $key => $value) 
        {
            $response[$key]['item_qty'] = $value['cart_item_quantity'];
        }
        Cart::delete_items(Request::input('cart_key'));
        return response()->json($response);
    }
    public function get_all_products()
    {
    	$response = Item::get_all_products(Request::input('slot_id'),Request::input());
    	return response()->json($response);
    }

    public function get_product()
    {
    	$response = Item::get_data(Request::input('item_id'), Request::input('slot_id'));
    	return response()->json($response);
    }

    public function get_cart_items()
    {
    	$response = Item::get_cart(Request::input(),Request::input('branch_id'));

        return response()->json($response);
    }

    public function checkout()
    {
        $response = Cashier::ecom_checkout(Request::input());

        return response()->json($response);
    }

    public function get_branch()
    {
        $response = Branch::get();

        return response()->json($response);
    }
    public function activate_product_code()
    {
        $data["pin"]            = Request::input("pin");
        $data["code"]           = Request::input("code");
        $data["slot_id"]        = Request::input("slot_id");
        $data["slot_owner"]     = Request::user()->id;
        
        $response = Product::activate_code($data);


        return response()->json($response);
    }

    public function get_location()
    {
        $response = DB::table('tbl_branch')->where('archived', '=', 0)->get();
        return response()->json($response);
    }
    public function get_delivery_charge()
    {
        $response['Direct'] = DB::table('tbl_delivery_charge')->where('method_name',"Direct")->first();
        $response['Indirect'] = DB::table('tbl_delivery_charge')->where('method_name',"Indirect")->first();
        return response()->json($response);
    }
    public function rate_item()
    {
        $item_rate      = Request::input('item_rate');
        $item_id        = Request::input('item_id');
        $user_id        = Request::user()->id;
        $item_review    = Request::input('item_review');
        $order_number   = Request::input('order_number');       
        $response       = Item::rate_item($item_rate,$item_id,$user_id,$item_review,$order_number);

        return Response()->json($response);
    }
    public function get_level_item()
    {
        $level = Request::input("level");
        $slot  = Tbl_slot::where("slot_owner",Request::user()->id)->where("slot_id",Request::input("current_slot_id"))->first();
        $start = Carbon::now()->startOfMonth();
        $end   = Carbon::now()->endOfMonth();
        $query = Tbl_unilevel_points::whereDate("unilevel_points_date_created", ">=", $start)
            ->whereDate("unilevel_points_date_created", "<=", $end)
            ->where("unilevel_points_slot_id", $slot->slot_id)
            ->where("unilevel_points_cause_level", $level == -1 ? 0 : $level)
            ->where('unilevel_points_distribute', 0);

        // Add the specific condition for `unilevel_points_type` based on `$level`
        $type = $level > -1 ? 'UNILEVEL_GPV' : 'UNILEVEL_PPV';
        $query->where('unilevel_points_type', $type);

        // Paginate the results
        $return["items"] = $query->paginate(5);
        foreach ($return["items"] as $key => $value) 
        {
            $return["items"][$key]->buyer_name = Tbl_slot::where("slot_id",$value->unilevel_points_cause_id)->first()->slot_no;
            $points = Tbl_item::where("item_id",$value->unilevel_item_id)->first();
            if($points->item_pv != 0)
            {
                $return["items"][$key]->sum_points =  $value->unilevel_points_amount;
            }
            else 
            {
                $return["items"][$key]->sum_points   =  0;
            }
            
            $return["items"][$key]->item_desc  =  $points;
        }
        $return["level"] = $level;
        $return["total_points"] = $query->sum('unilevel_points_amount');

        return Response()->json($return);
    }

    public function search_product()
    {
        $search    = Request::input('search');
        $return = Tbl_item::where('archived', 0)
        ->where(function ($query) {
            $query->where('item_availability', 'ecommerce')
                ->orWhere('item_availability', 'all');
        });

        if($search)
        {
            $return = $return->where("item_sku", "like", "%". $search . "%");
        }

        $return = $return->get();
        return response()->json($return);
    }

    public function get_product_link()
    {
        $item_id                            = Request::input('item_id');
        $user_id                            = Request::user()->id;
        $slot_no                            = Tbl_slot::where('slot_owner',$user_id)->first()->slot_no;
        $return['item_info']                = Tbl_item::where('item_id',$item_id)->first();
        $encrypt_id = Crypt::encryptString($return['item_info']->product_id);
        $return['product_link']             = "/member/product/link/".$slot_no."/".$encrypt_id;

        return $return;
    }
     public function get_payment_method()
    {
        return Tbl_cashier_payment_method::where('cashier_payment_method_name','Wallet')->get();
    }
   
    public function check_wallet()
    {
        $data                                                           = Request::input();
        $currency_id                                                    = Tbl_currency::where('currency_buying', 1)->pluck('currency_id')->first();
        $wallet                                                         = Tbl_wallet::where('slot_id',$data['info']['slot_id'])->where('currency_id',$currency_id)->first()->wallet_amount ?? 0;
       
        return $wallet;
    }
    public function checkout_v2()
    {
        $response = Cashier::ecom_checkout_v2(Request::input());

        return response()->json($response);
    }
    public function cancel_order()
    {
        $update['user_status']                                          = 'order_cancelled';
        $update['date_purchased']                                       = Carbon::now();   

        return "";
    }
    public function continue_to_shop()
    {
        $update['shop_status']                                          = 1;   

        return "";
    }
    public static function get_category_list()
	{
		$response 						= Tbl_product_category::where('archive',0)->get();
		
		return $response;
	}
	public static function get_subcategory_list()
	{
        $category_id = Request::input('category_id');

        if($category_id != 'all')
        {
            $response 	= Tbl_product_subcategory::where('category_id',$category_id)->where('archive',0)->get();
        }

		return $response;
	}
    public static function getbranch_ecom()
    { 
        $branch         = Tbl_branch::where('archived', 0)->leftJoin('tbl_stockist_level', 'tbl_branch.stockist_level', '=', 'tbl_stockist_level.stockist_level_id')->get();

        return $branch;
    }
    public static function get_first_category()
	{
		$response 						= Tbl_product_category::where('archive',0)->pluck('id')->first();
		return $response;
	} 
}