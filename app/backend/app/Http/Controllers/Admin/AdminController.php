<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Request;
use DB;

use App\Globals\Audit_trail;
use App\Globals\Membership;
use App\Globals\Item;
use App\Globals\Slot;
use App\Models\Tbl_slot;
use App\Models\Tbl_cashier;
use App\Models\Tbl_module_access;
use App\Models\Tbl_label;
use App\Models\Users;

class AdminController extends Controller
{
    function __construct()
    {

    }

    public function user_data()
    {
        if(isset(Request::user()->id))
        {
        	if(Request::user()->type == "member")
    		{	
              $check_has_slot = Tbl_slot::where("slot_owner",Request::user()->id)->first();
              if(!$check_has_slot)
              {
                  Slot::create_blank_slot(Request::user()->id);
              }
    		}	
        }

        if(isset(Request::user()->id))
        {
            if(Request::user()->type == "cashier")
            {	
                $check_status = Tbl_cashier::where("cashier_user_id",Request::user()->id)->first();
                
                Request::user()->status = $check_status->cashier_status;
            }	
        }
        
    	return Request::user();
    }

    public function get_membership()
	{
		$membership = Membership::get();

		return response()->json($membership, 200);
	}

	public function get_product()
	{
        $item = Item::get_product();

		return response()->json($item, 200);
    }
    public function get_product_unilevel()
	{
        $item = Item::get_product_unilevel();

		return response()->json($item, 200);
    }
    public function get_ldautoship()
	{
        $item = Item::get_ldautoship();

		return response()->json($item, 200);
    }
    public function save_product_unilevel()
	{
        $item = Item::save_product_unilevel(Request::input());

		return response()->json($item, 200);
    }
    public function save_ldautoship()
	{
        $item = Item::save_ldautoship(Request::input());

		return response()->json($item, 200);
    }

    public function get_admin_access()
    {
        if(Request::user()->position_id == 0)
        {
            $get  = DB::table('tbl_module')->where('module_type','admin')->get();

            foreach ($get as $key => $value) 
            {
                $response[$value->module_alias] = 0;
            }
        }
        else
        {
            $get  = Tbl_module_access::where('position_id',Request::user()->position_id)->Module()->get();

            foreach ($get as $key => $value) 
            {
                $response[$value->module_alias] = $value->module_access;
            }
        }

        return $response;
    }
    public function audit_login_trail()
    {
        $action = 'Login';
        $old_value = null;
        $new_value = null;
        $user      = Request::user()->id;
        Audit_trail::audit($old_value,$new_value,$user,$action);
    }

    public function get_logo()
    {
        $return = DB::table('tbl_company_details')->first();
        return response()->json($return);
    }
    
    public function get_company_details()
    {
        $return = DB::table('tbl_company_details')->first();

        return response()->json($return);
    }
    
    public function get_user_details()
	{

		$get_position						= Users::where('id',Request::user()->id)->leftjoin('tbl_position','tbl_position.position_id','users.position_id')->first();
		if($get_position)
		{
			$return         				= strtolower($get_position->position_name ?? 'superadmin');
		}
		return response()->json($return);
	}
    public function mlm_feature()
	{

        $return['store_replicated']           =  DB::table('tbl_mlm_feature')->where('mlm_feature_name','store_replicated')->value('mlm_feature_enable');
		return $return;

	}

    public function get_plan_label()
    {
        $labels = Tbl_label::select('plan_code', 'plan_name')->get();

        $plan = $labels->pluck('plan_name', 'plan_code');

        return response()->json($plan);
    }
}