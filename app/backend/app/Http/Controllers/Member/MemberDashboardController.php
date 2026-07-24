<?php
namespace App\Http\Controllers\Member;


use App\Models\Refbrgy;
use App\Models\Refcitymun;
use App\Models\Refprovince;
use App\Models\Refregion;
use App\Models\Tbl_currency;
use App\Models\Tbl_delivery_charge;
use App\Models\Tbl_island_group;
use App\Models\Tbl_other_settings;
use App\Models\Tbl_slot;
use App\Models\Tbl_earning_log;
use App\Models\Tbl_item;
use App\Models\Tbl_product_category;
use App\Globals\Item;
use App\Globals\Cashier;
use Validator;
use Crypt;

use Request;
use DB;
use App\Globals\Currency;
use App\Globals\Location;
use Illuminate\Support\Facades\Mail;


class MemberDashboardController extends MemberController
{
    public function currency_get()
    {
        $response  = Tbl_currency::where('currency_enable',1)->get();
        return response()->json($response, 200);
    }

    public function get_available_transfer_slots()
    {
        $response = Tbl_slot::where("from_bundle",1)->where("slot_owner",Request::user()->id)->select("slot_id","slot_no")->get();
        return response()->json($response, 200);
    }

    public function get_other_settings()
    {
        $response = null;

        if(Tbl_other_settings::where("key","allow_slot_transfer")->first())
        {
            $response["allow_slot_transfer"] = Tbl_other_settings::where("key","allow_slot_transfer")->first()->value;
        }
        
        if(Tbl_other_settings::where("key","register_on_slot")->first())
        {
            $response["register_on_slot"] = Tbl_other_settings::where("key","register_on_slot")->first()->value;
        }

        $response["register_your_slot"] = Tbl_other_settings::where("key","register_your_slot")->first() ? Tbl_other_settings::where("key","register_your_slot")->first()->value : 0;
        $response["product_activate"]     = Tbl_other_settings::where("key","product_activate")->first() ? Tbl_other_settings::where("key","product_activate")->first()->value : 1;
        $response["membership_kit_upgrade"]     = Tbl_other_settings::where("key","membership_kit_upgrade")->first() ? Tbl_other_settings::where("key","membership_kit_upgrade")->first()->value : 0;
        $response["name_on_dropdown"]     = Tbl_other_settings::where("key","name_on_dropdown")->first() ? Tbl_other_settings::where("key","name_on_dropdown")->first()->value : 0;
        $response["earning_in_switch_slot"]     = Tbl_other_settings::where("key","earning_in_switch_slot")->first() ? Tbl_other_settings::where("key","earning_in_switch_slot")->first()->value : 0;
        

        // dd($response);
        return response()->json($response, 200);
    }

    public function currency_converter()
    {
        $response           = Currency::convert_wallet(Request::all());
        return response()->json($response, 200);
    }
    public function currency_converter_submit()
    {
        $data    = Currency::convert_wallet(Request::all());
        if($data['status'] == 'success')
        {
            $return   = Currency::convert_submit($data);
        }
        else
        {
           $return['status'] = "error";
           $return['message'] = "Something went wrong!";
        }
        
        return response()->json($return, 200);
    }
    
    public function get_topEarner()
    {
        $first_date             = date('Y-m-d',strtotime('first day of this month'));
        $today                  = date('Y-m-d',strtotime('today'));
        $currency_id            = Tbl_currency::where('currency_default',1)->first()->currency_id;
        
        $response               = Tbl_earning_log::where('earning_log_currency_id',$currency_id)
                                ->whereDate('earning_log_date_created','>=',$first_date)->whereDate('earning_log_date_created','<=',$today)
		                        ->leftjoin('tbl_slot','tbl_slot.slot_id','=','tbl_earning_log.earning_log_slot_id')->leftjoin('users','users.id','=','tbl_slot.slot_owner')->where('type','member')->where('users.top_earner_status',1)
                                ->select( DB::raw('sum(earning_log_amount) as sum_earn') , 'users.name','users.email','users.contact','users.profile_picture')->groupby('users.id')
                                ->get();
	
		$response               = collect($response)->sortBy('sum_earn')->reverse()->toArray();
		$response               = array_slice($response, 0, 20);

		if(empty($response))
		{
			$response           = null;
		}
		else
		{
			$response           = $response;
		}
		return $response;
    }
    public function get_sponsor()
    {
        $get_owner              = DB::table('tbl_slot')->where('slot_owner',Request::input('id'))->first();
        $get_sponsor            = DB::table('tbl_slot')->where('slot_id',$get_owner->slot_sponsor)->first()->slot_no;
        $get_owner->populated   = isset($get_sponsor) ? $get_sponsor : '';
       
        return response()->json($get_owner, 200);
    }
    public function get_all_products()
    {
        $type                   = Request::input('type');
        if($type == 'all') {
            $return['product']      = Tbl_item::where('archived', 0)->where('item_availability','!=', 'cashier')->where('item_type', 'product')->get();
        } else {
            $return['product']      = Tbl_item::where('archived', 0)->where('item_category',$type)->where('item_availability','!=', 'cashier')->where('item_type', 'product')->get();
        }
        
        foreach($return['product'] as $key => $product) {
            $return['product'][$key]->encrypt_id =  Crypt::encryptString($product->item_id);
        }

        return $return;
    }
    public function get_new_arrivals()
    {
        return  Tbl_item::where('archived', 0)->where('item_type', 'product')->where('item_availability','!=', 'cashier')->where('tag_as','new')->get();
    }
    public function getProduct_info()
    {
        $item_id = Request::input('item_id');

        // Attempt decryption
        try {
            $decrypted_item_id = Crypt::decryptString($item_id);
            // Decryption successful, use decrypted item_id
            $item_id = $decrypted_item_id;
            $response = Tbl_item::where('item_id',$item_id)->leftjoin('tbl_product_category','tbl_product_category.id','tbl_item.item_category')->JoinInventory()->first();
            $response['quantity'] = 1;
            $response['status'] = 'valid';
        } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
            $response['status'] = 'invalid';
        }
       
        return $response;
    }
    public function get_products()
    {
        $item_id                = Request::input('item_id');
        // $category               = Request::input('category');
        $get_product_category   = Tbl_item::where('item_id',$item_id)->pluck('item_category')->first();
        $return['product']      = Tbl_item::where('archived', 0)->where('item_category',$get_product_category)->where('item_type', 'product')->where('item_availability','!=', 'cashier')->where('item_id','!=',$item_id)->get();
        foreach($return['product'] as $key => $product) {
            $return['product'][$key]->encrypt_id =  Crypt::encryptString($product->item_id);
        }
        return $return;
    }
    public function item_list()
    {
        $name           = Request::input('item_search_name') ?? null;
        // $category       = Request::input('category');

        $_item = Tbl_item::where('item_sku','like','%' .$name. '%')
                            ->whereIn("item_availability",['all','ecommerce'])
                            ->where("tbl_item.archived", 0)
                            ->where("tbl_item.item_type", "product");
                            
        // if($category != 'all')
        // {
        //     $_item = $_item->where("item_category",$category);
        // }
        
        $_item = $_item->limit(5)->get();

        foreach($_item as $key => $product) {
            $_item[$key]->encrypt_id =  Crypt::encryptString($product->item_id);
        }
        return $_item;
    }
    
    public function get_category_list()
    {
        // $return['first_category'] = Tbl_product_category::where('archive',0)->first();
        $return['other_category'] = Tbl_product_category::where('archive',0)->get();

        return $return;
    }

    public function getCategory()
    {
        $return['first_category']   = Tbl_product_category::where('archive',0)->first();
        $return['all_category']     = Tbl_product_category::where('archive',0)->get();

        return $return;
    }

    public function get_cart_items()
    {
    	$response = Item::get_landing_cart(Request::input(),Request::input('branch_id'));

        return response()->json($response);
    }
    public function get_location()
	{
		$location     	= Request::input("location");
		$response 		= Location::$location(Request::all());
		return 	response()->json($response);
	}
    

    public static function dropshipping_payment_method()
	{
        $name = ['Cash on Delivery'];
        $method = ['COD'];
        
        foreach($name as $index => $item) {
            $response[$index]['name'] = $name[$index];
            $response[$index]['method'] = $method[$index];
        }
		return response()->json($response);
	}   

    public static function checkout_orders()
	{
        $data = Request::all();
        $rules = [
            "contact" => "required",
            // "email" => "required|email",
            "last_name" => "required",
            "first_name" => "required",
        ];
        
        $rules2 = [
            "postal_code" => "required",
            "brgyCode" => "required|not_in:0",
            "citymunCode" => "required|not_in:0",
            "provCode" => "required|not_in:0",
            "regCode" => "required|not_in:0",
            "island_group" => "required|not_in:0",
            "address" => "required",
        ];

        $customMessages = [
            'brgyCode.required' => 'The Barangay is required.',
            'brgyCode.not_in' => 'The Barangay is required.',
            'citymunCode.required' => 'The City/Municiplity is required.',
            'citymunCode.not_in' => 'The City/Municiplity is required.',
            'provCode.required' => 'The Province is required.',
            'provCode.not_in' => 'The Province is required.',
            'regCode.required' => 'The Region is required.',
            'regCode.not_in' => 'The Region is required.',
            'island_group.required' => 'The Island Group is required.',
            'island_group.not_in' => 'The Island Group is required.',
            'address.required' => 'The Address is required.',
            'postal_code.required' => 'The Postal Code is required.',
        ];
        
        $validator = Validator::make($data["customer_info"], $rules);
        $validator2 = Validator::make($data["customer_address"], $rules2, $customMessages);
        
        $response["status_message"] = [];
        
        if ($validator->fails() || $validator2->fails()) {
            $response["status"] = "error";
            $response["status_code"] = 400;
        
            $errors = array_merge($validator2->errors()->getMessages(), $validator->errors()->getMessages());
        
            foreach ($errors as $error) {
                foreach ($error as $errorMessage) {
                    $response["status_message"][] = $errorMessage;
                }
            }
        }
		else
		{
            $data['address'] = Self::get_address($data['customer_address']);
            $response = Cashier::dropshipping_checkout($data);
        }

		return response()->json($response);

	}   

    private static function get_address($data) {
        $address = strtoupper($data['address']);
        $region = Refregion::where('regCode', $data['regCode'])->pluck('regDesc')->first();
        $province = Refprovince::where('provCode', $data['provCode'])->pluck('provDesc')->first();
        $city = Refcitymun::where('citymunCode', $data['citymunCode'])->pluck('citymunDesc')->first();
        $barangay = strtoupper(Refbrgy::where('brgyCode', $data['brgyCode'])->pluck('brgyDesc')->first());
        $island_group = Tbl_island_group::where('id', $data['island_group'])->pluck('island_group')->first();
        $postal_code = $data['postal_code'];
        
        $full_address = $address . ', ' . $barangay . ', ' . $city . ', ' . $province . ', ' . $region . ', ' . $postal_code;

        return $full_address;
    }

    public static function get_delivery_charge()
	{ 
        $response = Tbl_delivery_charge::where("method_name", "Dropshipping")->first();
        return $response;
    }

        public static function submit_contact()
    {
        $request = Request::all();

        // Validate the incoming request
        // $validatedData = validator($request, [
        //     'name' => 'required|string|max:255', // Name is required, must be a string, and limited to 255 characters
        //     'email' => 'required|email|max:255', // Email is required, must be valid, and limited to 255 characters
        //     'message' => 'required|string|min:5|max:2000', // Message is required, must be a string, between 5 and 2000 characters
        //     'subject' => 'nullable|string|max:255', // Subject is optional, must be a string, and limited to 255 characters
        // ])->validate(); // Validate and throw an exception if validation fails

        try {
            // Send the contact email via Gmail
            \Mail::send([], [], function ($message) use ($request) {
                $message->to($request['email'])
                    ->subject($request['subject'] ?? 'New Contact Form Submission') // Fixing subject here
                    ->setBody(
                        "<p><strong>Name:</strong> " . $request['name'] . "</p>" .
                        "<p><strong>Email:</strong> " . $request['email'] . "</p>" .
                        "<p><strong>Message:</strong></p><p>" . nl2br($request['message']) . "</p>",
                        'text/html'
                    );
            });

            return response()->json(['success' => true, 'message' => 'Message sent successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'There was an error sending your message.',
                'error' => $e->getMessage(), // Optional: Include this for debugging
            ], 500);
        }
    }

}
