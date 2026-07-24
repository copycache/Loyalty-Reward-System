<?php
namespace App\Http\Controllers\Admin;
use App\Globals\Audit_trail;
use App\Globals\Plan;
use App\Globals\Currency;
use App\Models\Tbl_investment_package;
use App\Models\Tbl_membership;
use App\Models\Tbl_investment_amount;
use App\Models\Tbl_mlm_plan;
use App\Models\Tbl_wallet_log;
use App\Models\Tbl_earning_log;
use App\Models\Tbl_label;
use App\Models\Tbl_membership_upgrade_settings;


use DB;

use Request;
use App\Globals\Investment;
class AdminPlanController extends AdminController
{
	public function update_membership_upgrade()
	{
		$data = Request::input('data');
		$settings = Request::input('settings');
		$id       = Tbl_membership_upgrade_settings::first()->membership_upgrade_settings_id;
		foreach($data as $key => $value)
		{
			$update['required_directs'] 		= $value['required_directs'];
			$update['required_downlines'] 		= $value['required_downlines'];
			$update['required_upgrade_points'] 	= $value['required_upgrade_points'];
			$update['given_upgrade_points'] 	= $value['given_upgrade_points'];
			DB::table('tbl_membership')->where('membership_id', $value['membership_id'])->update($update);
		}
		// dd($settings);
		$update2["membership_upgrade_settings_method"] = $settings['membership_upgrade_settings_method'];
		// $update2["membership_upgrade_settings_flushout"] = $settings['membership_upgrade_settings_flushout'];
		Tbl_membership_upgrade_settings::where("membership_upgrade_settings_id",$id)->update($update2);
		$return = Plan::update_status("MEMBERSHIP_UPGRADE",1);

		return response()->json($return);
	}

    public function get() 
	{
		
		$plan     = Request::input("plan");
		$response = Plan::get($plan);
	    return response()->json($response, 200);
	}

    public function update() 
	{
		$plan     = Request::input("plan");
		$label    = Request::input("label");
		$data     = Request::input("data");
		$trigger  = Request::input("trigger");
		$response = Plan::update($plan,$label,$data,$trigger);
	    return response()->json($response, 200);
	}

    public function update_status() 
	{
		$plan     = Request::input("plan");
		$send     = Request::input("send");
		$response = Plan::update_status($plan,$send);
	    return response()->json($response, 200);
	}
	public function currency_get()
	{
		$currency = Currency::settings_currency();
		return response()->json($currency, 200);
	}
	public function currency_update()
	{
		if(Request::input('param') == 'currency')
		{
			Currency::update_currency(Request::input('data'));
		}
		if(Request::input('param') == 'currency_conversion')
		{
			Currency::update_currency_conversion(Request::input('data'),Request::input('abbreviation'));
		}
		if(Request::input('param') == 'add_currency')
		{
			Currency::add_currency(Request::input('new_currency_name'),Request::input('new_currency_abbreviation'));
		}
	}
	public function investment_package_get()
	{
		if(Tbl_investment_package::count()==0)
		{
			$insert['investment_package_id'] 			= 1;	
			$insert['investment_package_days_bond'] 	= 1;		 
			$insert['investment_package_min_interest'] 	= 1;		 
			$insert['investment_package_max_interest'] 	= 1;		 
			$insert['investment_package_days_margin'] 	= 1;

			Tbl_investment_package::insert($insert);
		}
		$package = Tbl_investment_package::get();
		return response()->json($package, 200);
	}
	public function investment_package_submit()
	{
		$old_value  = Tbl_investment_package::get();
		foreach(Request::input() as $key => $package)
		{
			$data['investment_package_id'] 				= $package['investment_package_id'];
			$data['investment_package_days_bond'] 		= $package['investment_package_days_bond'];
			$data['investment_package_min_interest'] 	= $package['investment_package_min_interest'];
			$data['investment_package_max_interest'] 	= $package['investment_package_max_interest'];
			$data['investment_package_days_margin'] 	= $package['investment_package_days_margin'];
			$data['bind_membership'] 					= $package['bind_membership'];
			$data['archive'] 							= $package['archive'];
			$count = Tbl_investment_package::where('investment_package_id',$package['investment_package_id'])->count();
			if($count==0)
			{
				Tbl_investment_package::insert($data);
			}
			else
			{
				Tbl_investment_package::where('investment_package_id',$package['investment_package_id'])->update($data);
			}

		}
		$new_value  = Tbl_investment_package::get();
		$action     = "Package Submit";
		$user       = Request::user()->id;
		Audit_trail::audit(serialize($old_value),serialize($new_value),$user,$action);
		
		$response['status_message'] = "Package Successfully Updated!";
		return response()->json($response, 200);
	}

	public function get_investment_amount()
	{
		$response = Tbl_investment_amount::first();
		return $response;
	}
	public function update_investment_amount()
	{
		$min_amount							= Request::input('min_amount');
		$max_amount							= Request::input('max_amount');
		
		if($min_amount >= 1 && $max_amount != 0)
		{
			if($max_amount >= $min_amount)
			{
				$update['min_amount']		= $min_amount;
				$update['max_amount']		= $max_amount;

				Tbl_investment_amount::where('id',1)->update($update);

				$return['status'] 			= 'Success';
				$return['status_message']	= 'Investment Amount updated sucessfully';
			}
			else
			{
				$return['status'] 			= 'Error';
				$return['status_message']	= 'Minimun amount must be less than to Maximum Amount';
			}
				
		}
		else
		{
			$return['status'] 				= 'Error';
			$return['status_message']		= 'Please input correct value';

		}
		return $return;
	}
	
}
