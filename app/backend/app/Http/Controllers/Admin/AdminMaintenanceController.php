<?php
namespace App\Http\Controllers\Admin;
use App\Models\Tbl_module_access;

use App\Globals\Audit_trail;
use App\Globals\Seed;
use App\Globals\Log;

use App\Models\Users;
use App\Models\Tbl_currency;
use App\Models\Tbl_label;
use App\Models\Tbl_wallet_log;
use App\Models\Tbl_mlm_plan;
use App\Models\Tbl_slot;
use App\Models\Tbl_other_settings;
use App\Models\Tbl_adjust_wallet_log;

use DB;
use Excel;
use Request;
use App\Globals\Slot;
use Carbon\Carbon;
use Validator;
use Hash;
use Crypt;
use Session;

class AdminMaintenanceController extends AdminController
{
	public function get_module()
	{
		$response = Self::get_module_settings(Request::input('module_type'));

		return Response()->json($response);
	}

	public function get_other_settings()
	{
		Seed::other_settings_seed();
		$response = null;
		$return   = Tbl_other_settings::get();
		$response = $return;
		return Response()->json($response);
	}


	public function update_other_settings()
	{
		foreach (Request::input() as $key => $value) 
		{
			if($value['key'] == 'default_slot_limit')
			{
				$update['value'] = $value['value'];
			}
			else
			{
				if($value["value"] == true)
				{
					$value["value"] = 1;
				}
				else if($value["value"] == false)
				{
					$value["value"] = 0;
				}

				$update['value'] = $value["value"];
			}
			Tbl_other_settings::where('key',$value['key'])->update($update);
		}

		$response = Tbl_other_settings::get();
		return Response()->json($response);	
	}

	public function update_module()
	{
		$user   = Request::user()->id;
		$action = "Update Module"; 
		$old_value = DB::table('tbl_module')->get();
		foreach (Request::input('data') as $key => $value) 
		{
			$update['module_name'] 		= $value['module_name'];
			$update['module_is_enable'] = $value['module_is_enable'];
			$update['slot_is_enable'] 	= $value['slot_is_enable'];

			DB::table('tbl_module')->where('module_id',$value['module_id'])->update($update);
		}
		$new_value = DB::table('tbl_module')->get();
		Audit_trail::audit(serialize($old_value),serialize($new_value),$user,$action);

		$response = Self::get_module_settings(Request::input('module_type'));
		return Response()->json($response);	
	}

	public function create_position()
	{
		$return['status']  = "SUCCESS";
		$return['message'] = "Position Updated";
		$action     = "Create Position";
		$user   	= Request::user()->id;
		$old_value  = DB::table('tbl_position')->get();
	    if(Request::input('action') == 'add')
		{
			$check = DB::table('tbl_position')->where('position_name',Request::input('position_name'))->first();
			if(!$check)
			{
				$position['position_name'] 		= Request::input('position_name');
				$position['position_created'] 	= Carbon::now();
				$position_id = DB::table('tbl_position')->insertGetId($position);
				foreach (Request::input('module_access') as $key => $value) 
				{
					$access['module_id'] 		= $value['module_id'];
					$access['module_access']  	= $value['module_access'];
					$access['position_id']  	= $position_id;
					DB::table('tbl_module_access')->insertGetId($access);
				}
			}
			else
			{
				$return['status'] = "ERROR";
				$return['message'] = "Position Already Exist";
			}
		}
		
		else if(Request::input('action') == 'edit')
		{
			$check = DB::table('tbl_position')->where('position_id',Request::input('position_id'))->first();
			if($check)
			{
				$position['position_name'] 		= Request::input('position_name');
				$position['position_created'] 	= Carbon::now();
				$position_id = DB::table('tbl_position')->where('position_id',Request::input('position_id'))->update($position);
				foreach (Request::input('module_access') as $key => $value) 
				{
					$access['module_access']  	= $value['module_access'];
					DB::table('tbl_module_access')->where('module_access_id',$value['module_access_id'])->update($access);
				}
			}
			else
			{
				$return['status']  = "ERROR";
				$return['message'] = "Position Not Exist";
			}
		}
		$new_value  = DB::table('tbl_position')->get();
		Audit_trail::audit(serialize($old_value),serialize($new_value),$user,$action);
		return Response()->json($return);
	}
	public function create_admin()
	{
		$data  = Request::all();
		$rules["email"]    		= "unique:users,email";
		$rules["first_name"]    = "required";
		$rules["last_name"]    	= "required";
		$rules["position_id"]   = "required";
		$rules["password"] 		= "required";
		$rules["password_confirmation"]    = "required|same:password";
		
		
		$validator = Validator::make($data, $rules);

        if ($validator->fails()) 
        {
            $return["status"]         = "error"; 
			$return["status_code"]    = 400; 
			$return["status_message"] = [];

			$i = 0;
			$len = count($validator->errors()->getMessages());

			foreach ($validator->errors()->getMessages() as $key => $value) 
			{
				foreach($value as $val)
				{
					$return["status_message"][$i] = $val;

				    $i++;		
				}
			}
        }
        else
        {
        	$insert["email"]			= $data["email"];
			$insert["password"]			= Hash::make($data["password"]);
			$insert["crypt"]			= Crypt::encryptString($data["password"]);
			$insert["created_at"]		= Carbon::now();
			$insert["type"]				= "admin";
			$insert["first_name"]		= $data["first_name"];
			$insert["last_name"]		= $data["last_name"];
			$insert["contact"]			= $data["contact"];
			$insert["position_id"]      = $data["position_id"];
			$insert["country_id"]	    = 1;
			$insert["name"]	            = $data["first_name"]." ".$data["last_name"];
        	
        	$user_id  = DB::table('users')->insertGetId($insert);

			$return["status"]         = "success"; 
			$return["status_code"]    = 400; 
			$return["status_message"] = "ADMIN ADDED SUCCESSFULLY";
		}

		$user      = Request::user()->id;
		$action    = "Create Admin";
		$new_value = DB::table('users')->where('id',$user_id)->first();
		Audit_trail::audit(null,serialize($new_value),$user,$action);

		return $return;
	}

	public function update_admin()
	{
		$data  = Request::all();
		$rules["first_name"]    = "required";
		$rules["last_name"]    	= "required";
		$rules["position_id"]   = "required";
		$rules["password"] 		= "required";
		
		
		
		$validator = Validator::make($data, $rules);

        if ($validator->fails()) 
        {
            $return["status"]         = "error"; 
			$return["status_code"]    = 400; 
			$return["status_message"] = [];

			$i = 0;
			$len = count($validator->errors()->getMessages());

			foreach ($validator->errors()->getMessages() as $key => $value) 
			{
				foreach($value as $val)
				{
					$return["status_message"][$i] = $val;

				    $i++;		
				}
			}
        }
        else
        {
        	$update["first_name"]		= $data["first_name"];
			$update["last_name"]		= $data["last_name"];
			$update["email"]			= $data["email"];
			$update["contact"]			= $data["contact"];
			$update["position_id"]      = $data["position_id"];
			$update["name"]	            = $data["first_name"]." ".$data["last_name"];
        	$update["password"]			= Hash::make($data["show_password"]);
			$update["crypt"]			= Crypt::encryptString($data["show_password"]);
        	
        	DB::table('users')->where('id',$data['id'])->update($update);

			$return["status"]         = "success"; 
			$return["status_code"]    = 400; 
			$return["status_message"] = "ADMIN UPDATED SUCCESSFULLY";
		}
		return $return;
	}

	public function get_admin()
	{
		$return = Users::JoinPosition()->where('type','admin')->get();


		foreach ($return as $key => $value) 
		{
			$return[$key]->show_password = Crypt::decryptString($value->crypt);
			$return[$key]->user_access = Tbl_module_access::Module()->where('position_id',$value->position_id)->get();
		}
		return Response()->json($return);
	}

	public function get_position()
	{
		$return = DB::table('tbl_position')->get();

		foreach ($return as $key => $value) 
		{
			$return[$key]->module_access = Tbl_module_access::Module()->where('position_id',$value->position_id)->get();
		}
		// dd($return);
		return Response()->json($return);
    }

	public static function get_module_settings($module_type)
	{
		$return = DB::table('tbl_module')->where('module_type',$module_type)->get();
		foreach ($return as $key => $value) 
		{
			$return[$key]->module_access = 0;
		}
		return $return;
	}

	public function save_logo()
	{
		$check = DB::table('tbl_company_details')->first();
		if($check)
		{
			$update['logo']		= Request::input('url');
			
			DB::table('tbl_company_details')->where('company_details_id', $check->company_details_id)->update($update);
			$return['status_message'] = "Logo Successfully Updated";
			$return['status'] = "success";
		}
		else
		{
			$insert['logo']		= Request::input('url');
			$insert['contact_number']		= 0;
			DB::table('tbl_company_details')->insert($insert);
			$return['status_message'] = "Logo Successfully Added";
			$return['status'] = "success";
		}

		if(!$return)
		{
			$return['status_message'] = "Something Went Wrong";
			$return['status'] = "error";
		}

		return response()->json($return);
	}

	public function adjust_wallet($data)
	{
		// dd($data);
		$data['trigger'] = Request::user()->id;
		if($data['type'] && $data["slot_code"] && $data["amount"])
    	{
			$data['currency_abb'] = isset($data['currency_abb']) ? $data['currency_abb'] : null;

			if($data['currency_abb'] == null || $data['currency_abb'] == '' || !isset($data['currency_abb']))
			{
				$data['currency_abb'] = Tbl_currency::where("currency_default",1)->first()->currency_abbreviation;
				$data['currency_id'] = Tbl_currency::where("currency_default",1)->first()->currency_id;
			}
			else 
			{
				$check = Tbl_currency::where("currency_abbreviation",$data['currency_abb'])->first();
				if($check)
				{
					$data['currency_abb']  = $check->currency_abbreviation;
					$data['currency_id']   = $check->currency_id;
				}
				else 
				{
					$data['currency_abb'] = Tbl_currency::where("currency_default",1)->first()->currency_abbreviation;	
					$data['currency_id'] = Tbl_currency::where("currency_default",1)->first()->currency_id;
				} 
			}


			$data['slot_id'] = Tbl_slot::where("slot_no",$data["slot_code"])->first() ? Tbl_slot::where("slot_no",$data["slot_code"])->first()->slot_id : null;

			if($data['slot_id'])
			{
				$plan_code     = Tbl_label::where('plan_name',$data['type'])->first();
				if($plan_code)
				{
					// dd('hello');
					$entry         = Tbl_mlm_plan::where('mlm_plan_code',$plan_code->plan_code)->first()->mlm_plan_trigger;
					$details       = "";
					$level         = 1;
					
					if($data['amount'] != 0)
					{
						//audit trail old value
						$old_value = Tbl_wallet_log::where("wallet_log_slot_id",$data['slot_id'])->where("currency_id",$data['currency_id'])->sum("wallet_log_amount");
						//
	
						Log::insert_wallet($data['slot_id'],$data['amount'],$plan_code->plan_code,$data['currency_id']);
						Log::insert_earnings($data['slot_id'],$data['amount'],$plan_code->plan_code,$entry,$data['trigger'],$details,$level,$data['currency_id']);
	
						//audit trail old value
						$new_value = Tbl_wallet_log::where("wallet_log_slot_id",$data['slot_id'])->where("currency_id",$data['currency_id'])->sum("wallet_log_amount");
						//
	
						$action = "Adjust Wallet";
						Audit_trail::audit($old_value,$new_value,$data['trigger'],$action);
						$insert["slot_id"]        		= $data['slot_id']; 
						$insert["adjusted_currency"]    = $data['currency_abb']; 
						$insert["adjusted_detail"] 		= $data['type'];
						$insert["adjusted_amount"] 		= $data['amount'];
						$insert["date_created"] 		= Carbon::now();
	
						Tbl_adjust_wallet_log::insert($insert);
	
						$return["status"]         = "success"; 
						$return["status_code"]    = 201; 
						$return["status_message"] = "Wallet Adjusted";
					}
					else 
					{
						$return["status"]         = "Error"; 
						$return["status_code"]    = 200; 
						$return["status_message"] = "Amount is Invalid";	
					}
				}
				else 
				{
					// dd($data);
					if($data['amount'] != 0)
					{
						//audit trail old value
						$old_value = Tbl_wallet_log::where("wallet_log_slot_id",$data['slot_id'])->where("currency_id",$data['currency_id'])->sum("wallet_log_amount");
						//
						Log::insert_wallet($data['slot_id'],$data['amount'],$data['type'],$data['currency_id']);
						//audit trail old value
						$new_value = Tbl_wallet_log::where("wallet_log_slot_id",$data['slot_id'])->where("currency_id",$data['currency_id'])->sum("wallet_log_amount");
						//
						$action = "Adjust Wallet";
						Audit_trail::audit($old_value,$new_value,$data['trigger'],$action);
	
						$insert["slot_id"]        		= $data['slot_id']; 
						$insert["adjusted_currency"]    = $data['currency_abb']; 
						$insert["adjusted_detail"] 		= $data['type'];
						$insert["adjusted_amount"] 		= $data['amount'];
						$insert["date_created"] 		= Carbon::now();
	
						Tbl_adjust_wallet_log::insert($insert);
	
						$return["status"]         = "success"; 
						$return["status_code"]    = 201; 
						$return["status_message"] = "Wallet Adjusted";
					}
					else 
					{
						$return["status"]         = "Error"; 
						$return["status_code"]    = 200; 
						$return["status_message"] = "Amount is Invalid";	
					}
				}
			}
			else 
			{
				$return["status"]         = "Error"; 
				$return["status_code"]    = 200; 
				$return["status_message"] = "No Slot";
			}
    	}
    	else
    	{
    		$return["status"]         = "Error"; 
			$return["status_code"]    = 200; 
			$return["status_message"] = "No Plan Trigger";
    	}
	}

	public function get_user_details()
	{
		return	Request::user()->id;
	}
}
