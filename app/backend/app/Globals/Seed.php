<?php
namespace App\Globals;

use DB;
use Carbon\Carbon;
use Hash;
use Crypt;
use Schema;

class Seed
{
	public static function initial_seed()
	{
		$return = [];

    try {
        Seed::country_seed();
        Seed::tab_module_seed();
        Seed::mlm_plan_seed();
        Seed::membership_seed();
        Seed::direct_bonus_seed();
        Seed::slot_seed();
        Seed::currency_seed();
        Seed::mlm_settings_seed();
        Seed::cash_in_method_category_seed();
        Seed::location_seed();
        Seed::stockist_level_seed();
        Seed::item_seed();
        Seed::branch_seed();
        Seed::inventory_seed();
        Seed::stockist_level_discount_seed();
        Seed::service_charge_seed();
        Seed::cash_in_method_seed();
        Seed::cash_out_method_seed();
        Seed::philippines_location();
        Seed::delivery_charge();
        Seed::get_fill_cashin_wallet();
        Seed::customized_settings();
        Seed::cashier_payment_method_seed();
        Seed::top_recruiter_seed();
        Seed::other_settings_seed();
        Seed::investment_amount();
        Seed::island_group();
		
        $return["status"]         = "success";
        $return["status_code"]    = 1;
        $return["status_message"] = "Successfully seeded";
		} catch (\Throwable $e) {
			// Handle the exception here
			$return["status"]         = "error";
			$return["status_code"]    = 0;
			$return["status_message"] = "Error seeding: " . $e->getMessage();
		}

		return $return;
	}

	public static function get_fill_cashin_wallet()
	{
		$proof = DB::table("tbl_cash_in_proofs")->where("cash_in_wallet","")->get();
		foreach ($proof as $key => $value)
		{
			$update['cash_in_wallet'] = $value->cash_in_currency;
			DB::table("tbl_cash_in_proofs")->where("cash_in_proof_id",$value->cash_in_proof_id)->update($update);

		}
		DB::table("tbl_cash_in_proofs")->where("cash_in_currency","php")->update(['cash_in_currency'=>'PHP','cash_in_wallet'=>'PHP']);
		DB::table("tbl_cash_in_proofs")->where("cash_in_currency","usd")->update(['cash_in_currency'=>'USD','cash_in_wallet'=>'USD']);
		DB::table("tbl_cash_in_proofs")->where("cash_in_currency","gc")->update(['cash_in_currency'=>'GC','cash_in_wallet'=>'GC']);
		DB::table("tbl_cash_in_proofs")->where("cash_in_currency","btc")->update(['cash_in_currency'=>'BTC','cash_in_wallet'=>'BTC']);

		DB::table("tbl_cash_in_method")->where("cash_in_method_currency","php")->update(['cash_in_method_currency'=>'PHP']);
		DB::table("tbl_cash_in_method")->where("cash_in_method_currency","usd")->update(['cash_in_method_currency'=>'USD']);
		DB::table("tbl_cash_in_method")->where("cash_in_method_currency","gc")->update(['cash_in_method_currency'=>'GC']);
		DB::table("tbl_cash_in_method")->where("cash_in_method_currency","btc")->update(['cash_in_method_currency'=>'BTC']);

	}

	public static function customized_settings()
	{
		$replicated = ['membership','product'];

		foreach ($replicated as $key => $value)
		{
			$check = DB::table('tbl_replicated_settings')->where('replicated_name',$value)->first();
			if(!$check)
			{
				$insert['replicated_name'] = $value;
				DB::table('tbl_replicated_settings')->insert($insert);
			}
		}

		$feature = ['send_wallet','conversion_wallet','product_replicated', 'store_replicated', 'auto_distribute', 'code_transfer', 'website_maintenance', 'code_transfer_non'];

		foreach ($feature as $key => $value)
		{
			$check = DB::table('tbl_mlm_feature')->where('mlm_feature_name',$value)->first();
			if(!$check)
			{
				$featured['mlm_feature_name'] = $value;
				DB::table('tbl_mlm_feature')->insert($featured);
			}
		}
	}

	public static function tab_module_seed()
	{
		$module      = ['My Wallet','Cash In','Cash Out','Code Vault','Leads','Earnings','My Network','Shopping','Investment'];
		$alias       = ['mywallet','cashin','cashout','coadevault','leads','earnings','mynetwork','shopping','investment'];

		foreach ($module as $key => $value)
		{
			$check = DB::table('tbl_module')->where('module_name',$value)->where('module_type','member')->first();
			if(!$check)
			{
				$insert['module_name'] = $value;
				$insert['module_alias'] = $alias[$key];
				$insert['module_type'] = 'member';
				DB::table('tbl_module')->insert($insert);
			}
		}
		$a_module      = ['Dashboard','Member List','Product','Orders','Cashin Processing','Cashout Processing','Stockist And Branches','Marketing Plan','Reports','Maintenance','Unilevel','Unilevel Two','Manage Settings','Product Category','Sub-admin Settings'];
		$a_alias       = ['dashboard','member','product','orders','cashin','payout','cashier','marketing','report','maintenance','unilevel','unileveltwo','managesettings','product_category','admin_change_pass'];

		foreach ($a_module as $key => $value)
		{
			$check = DB::table('tbl_module')->where('module_name',$value)->where('module_type','admin')->first();
			if(!$check)
			{
				$a_insert['module_name']  = $value;
				$a_insert['module_alias'] = $a_alias[$key];
				$a_insert['module_type']  = 'admin';
				$module_id = DB::table('tbl_module')->insertGetId($a_insert);
			}
			else
			{
				$module_id = $check->module_id;
			}

			$checks = DB::table('tbl_position')->get();

			foreach ($checks as $keyss => $val)
			{
				$checkss = DB::table('tbl_module_access')->where('module_id',$module_id)->where('position_id',$val->position_id)->count();
				if($checkss == 0)
				{
					$insert_access['position_id']  		= $val->position_id;
					$insert_access['module_access']  	= 1;
					$insert_access['module_id']  		= $module_id;

					DB::table('tbl_module_access')->insert($insert_access);
				}


			}
		}
	}

	public static function reset_seed()
	{

		$return["status"]         = "success";
		$return["status_code"]    = 1;
		$return["status_message"] = "Successfully reset";

		return $return;
	}

	public static function hard_reset_seed()
	{
		DB::table("tbl_country")->truncate();

		$return["status"]         = "success";
		$return["status_code"]    = 1;
		$return["status_message"] = "Successfully hard reset";

		return $return;
	}

	public static function currency_seed()
	{
		$name     = ['Philippine Peso','US Dollar', 'Gift Card', 'Bitcoin', 'Savings Wallet', 'Matched Points', 'One Leg Points', 'Indirect Points','COD','Available Cashin Wallet','CD Wallet', 'Unilevel Points'];
		$abv      = ['PHP','USD','GC','BTC', 'SW', 'MP', 'OLP', 'IP','COD','CW','OB','CDW','UPTS'];
		$set      = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		foreach($name as $key => $value)
		{
			$insert["currency_name"]         = $value;
			$insert["currency_abbreviation"] = $abv[$key];
			$insert["currency_default"]      = $set[$key];
			$insert["currency_buying"]       = $set[$key];
			$insert["currency_enable"]       = $set[$key];
			$check = DB::table("tbl_currency")->where("currency_abbreviation",$abv[$key])->first();

			if(!$check)
			{
				DB::table("tbl_currency")->insert($insert);
			}
		}

		foreach($abv as $key => $val)
		{
			foreach($abv as $key => $value)
			{
				if($value != $val)
				{
					$conversion["currency_conversion_from"] = $val;
					$conversion["currency_conversion_to"] 	= $value;
					$conversion["created_at"]				= Carbon::now();

					$check = DB::table("tbl_currency_conversion")->where("currency_conversion_from",$val)->where("currency_conversion_to",$value)->first();

					if(!$check)
					{
						DB::table("tbl_currency_conversion")->insert($conversion);
					}

				}
			}
		}

	}

	public static function country_seed()
	{
		$country  = ['Philippines','Japan','USA'];
		$currency = ['PHP'        ,'JPY'  ,'USD'];
		foreach($country as $key => $value)
		{
			$insert["country_name"]  = $value;
			$insert["currency_code"] = $currency[$key];
			$check = DB::table("tbl_country")->where("country_name",$value)->first();

			if(!$check)
			{
				DB::table("tbl_country")->insert($insert);
			}
		}
	}

	public static function mlm_plan_seed()
	{
		$code    = ['BINARY','DIRECT','UNILEVEL','INDIRECT','BINARY_REPURCHASE','DROPSHIPPING_BONUS','WELCOME_BONUS'];
		$trigger = ['Slot Placement','Slot Creation','Slot Repurchase','Slot Creation','Slot Repurchase','Special Plan','Slot Creation'];

		foreach($code as $key => $value)
		{
			$insert["mlm_plan_code"]    = $value;
			$insert["mlm_plan_label"]   = "";
			$insert["mlm_plan_trigger"] = $trigger[$key];
			$insert["mlm_plan_enable"]  = 0;

			$check = DB::table("tbl_mlm_plan")->where("mlm_plan_code",$value)->first();

			if(!$check)
			{
				DB::table("tbl_mlm_plan")->insert($insert);
			}
		}
	}

	public static function membership_seed()
	{
		$membership  = ['Bronze'];
		$price       = [5000];
		$count       = DB::table("tbl_membership")->count();

		if($count == 0)
		{
			DB::statement("ALTER TABLE tbl_membership AUTO_INCREMENT =  1");
			foreach($membership as $key => $value)
			{
				$insert["membership_name"]         = $value;
				$insert["membership_price"]        = $price[$key];
				$insert["membership_date_created"] = Carbon::now();

			DB::table("tbl_membership")->insert($insert);
			}
		}
	}

	public static function direct_bonus_seed()
	{
		$direct_hierarchy    		= [1];
		$direct_bonus_checkpoint    = [10000];
		$direct_bonus_amount       	= [5000];
		$count       = DB::table("tbl_direct_bonus")->count();

		if($count == 0)
		{
			DB::statement("ALTER TABLE tbl_direct_bonus AUTO_INCREMENT =  1");
			foreach($direct_hierarchy as $key => $value)
			{
				$insert["hierarchy"]         	   = $value;
				$insert["direct_bonus_checkpoint"] = $direct_bonus_checkpoint[$key];
				$insert["direct_bonus_amount"]     = $direct_bonus_amount[$key];

			DB::table("tbl_direct_bonus")->insert($insert);
			}
		}
	}

	public static function slot_seed()
	{
		$count       = DB::table("tbl_slot")->count();

		if($count == 0)
		{
			DB::statement("ALTER TABLE tbl_slot AUTO_INCREMENT =  1");

			$admin_id = null;
			if(!$admin_id)
			{
				$insert_admin["name"]			= "Administrator";
				$insert_admin["email"]			= "iqonelitecorp@digima.com";
				$insert_admin["password"]		= Hash::make("@dGmW3b2025");
				$insert_admin["remember_token"]	= null;
				$insert_admin["created_at"]		= Carbon::now();
				$insert_admin["updated_at"]		= Carbon::now();
				$insert_admin["type"]			= "admin";
				$insert_admin["crypt"]			= Crypt::encryptString("@dGmW3b2025");
				$insert_admin["first_name"]		= "";
				$insert_admin["last_name"]		= "";
				$insert_admin["contact"]		= "";
				$insert_admin["country_id"]		= 0;

				DB::table("users")->insert($insert_admin);

				$admin_id = DB::table("users")->where("type","admin")->first();
			}

			$admin_id = $admin_id->id;

			$insert["slot_no"]                 = "root";
			$insert["slot_id_number"]          = Slot::generate_slot_id_number();
			$insert["slot_membership"]         = 1;
			$insert["slot_position"]           = "LEFT";
			$insert["slot_sponsor"]            = 0;
			$insert["slot_owner"]              = $admin_id;
			$insert["slot_type"]               = "PS";
			$insert["slot_date_created"]       = Carbon::now();


			DB::table("tbl_slot")->insert($insert);



		}
	}

	public static function mlm_settings_seed()
	{
		$count       = DB::table("tbl_mlm_settings")->count();

		if($count == 0)
		{
			$mlm_setting["mlm_slot_no_format_type"]      = 1;
			$mlm_setting["mlm_slot_no_format"]			 = "";
			$mlm_setting["free_registration"]			 = 0;
			$mlm_setting["multiple_type_membership"]	 = 0;
			$mlm_setting["gc_inclusive_membership"]		 = 0;
			$mlm_setting["product_inclusive_membership"] = 0;
			DB::table("tbl_mlm_settings")->insert($mlm_setting);
		}
	}



	public static function admin_seed()
	{
		$count       = DB::table("tbl_slot")->count();

		if($count == 0)
		{
			DB::statement("ALTER TABLE tbl_slot AUTO_INCREMENT =  1");
			$admin_id = DB::table("users")->where("type","admin")->first();
			$admin_id = $admin_id->id;

			$insert["slot_no"]                 = "root";
			$insert["slot_membership"]         = 1;
			$insert["slot_position"]           = "LEFT";
			$insert["slot_sponsor"]            = 0;
			$insert["slot_owner"]              = $admin_id;
			$insert["slot_date_created"]       = Carbon::now();

			DB::table("tbl_slot")->insert($insert);
		}
	}

	public static function cash_in_method_category_seed()
	{
		$category_name     = ['remittance', 'bank', 'paymaya', 'crypto','crypto2', 'e-wallet'];
		foreach($category_name as $key => $value)
		{
			$insert["cash_in_method_category"]         = $value;
			$check = DB::table("tbl_cash_in_method_category")->where("cash_in_method_category",$value)->first();

			if(!$check)
			{
				DB::table("tbl_cash_in_method_category")->insert($insert);
			}
		}
	}

	public static function location_seed()
	{
		$count       = DB::table("tbl_location")->count();

		if($count == 0)
		{
			DB::statement("ALTER TABLE tbl_location AUTO_INCREMENT =  1");

			$insert["location"]                 = "Manila";

			DB::table("tbl_location")->insert($insert);
		}
	}

	public static function stockist_level_discount_seed()
	{
		$count       = DB::table("tbl_item_stockist_discount")->count();

		if($count == 0)
		{
			DB::statement("ALTER TABLE tbl_item_stockist_discount AUTO_INCREMENT =  1");

			$insert["stockist_level_id"]                 = 1;
			$insert["item_id"]          			     = 1;

			DB::table("tbl_item_stockist_discount")->insert($insert);
		}
	}

	public static function stockist_level_seed()
	{
		$count       = DB::table("tbl_stockist_level")->count();

		if($count == 0)
		{
			DB::statement("ALTER TABLE tbl_stockist_level AUTO_INCREMENT =  1");

			$insert["stockist_level_name"]                 = "Mobile";
			$insert["stockist_level_date_created"]          = Carbon::now();

			DB::table("tbl_stockist_level")->insert($insert);
		}
	}

	public static function item_seed()
	{
		$count       = DB::table("tbl_item")->count();

		if($count == 0)
		{
			DB::statement("ALTER TABLE tbl_item AUTO_INCREMENT =  1");

			$insert["item_sku"]              			= "Sample Item";
			$insert["item_description"]              	= "Sample Item";
			$insert["item_barcode"]              		= "11101";
			$insert["membership_id"]              		=  1;
			$insert["product_id"]              			= 'P00000001';
			$insert["item_date_created"]              	= Carbon::now();

			DB::table("tbl_item")->insert($insert);
		}
	}

	public static function branch_seed()
	{
		$count       = DB::table("tbl_branch")->count();

		if($count == 0)
		{
			DB::statement("ALTER TABLE tbl_branch AUTO_INCREMENT =  1");

			$insert["branch_name"]                 = "Main";
			$insert["branch_type"]                 = "Branch";
			$insert["branch_location"]             = "Manila";
			$insert["branch_date_created"]          = Carbon::now();
			$insert['stockist_level']				= 1;
			$branch_id = DB::table("tbl_branch")->insert($insert);



		}
	}

	public static function inventory_seed()
	{
		$count       = DB::table("tbl_inventory")->count();

		if($count == 0)
		{
			DB::statement("ALTER TABLE tbl_inventory AUTO_INCREMENT =  1");

			$insert['inventory_branch_id'] 	= 1;
			$insert['inventory_item_id'] 		= 1;

			DB::table("tbl_inventory")->insert($insert);
		}
	}

	public static function service_charge_seed()
	{
		$service     = ['cash_in', 'cash_out'];
		$charge      = [10, 10];
		foreach($service as $key => $value)
		{
			$insert["service_name"]           = $value;
			$insert["service_charge"]         = $charge[$key];
			$check = DB::table("tbl_service_charge")->where("service_name",$value)->first();

			if(!$check)
			{
				DB::table("tbl_service_charge")->insert($insert);
			}
		}
	}

	public static function cashier_payment_method_seed()
	{
		$payment_method     = ['Cash', 'Cheque', 'GC', 'Wallet','COD'];
		foreach($payment_method as $key => $value)
		{
			$insert["cashier_payment_method_name"]           = $value;
			$check = DB::table("tbl_cashier_payment_method")->where("cashier_payment_method_name",$value)->first();

			if(!$check)
			{
				DB::table("tbl_cashier_payment_method")->insert($insert);
			}

		}
	}

	public static function cash_in_method_seed()
	{
		$method            = ['Banco De Oro', 'Cebuana Lhuillier', 'GCash', 'Bitcoin'];
		$category          = ['bank', 'remittance', 'remittance', 'crypto'];
		$thumbnail         = [
			'../../../assets/admin/payment/BDO.png',
			'../../../assets/admin/payment/cebuana-lhuillier.png',
			'../../../assets/admin/payment/GCASH.svg',
			'../../../assets/admin/payment/Bitcoin.png'];
		$currency 	       = ['php', 'php', 'php', 'btc'];
		$fix_charge    	   = [10, 20, 30, 0.0001];
		$percent_charge    = [2, 4, 6, 8];
		$primary 		   = ['Digima Web Solutions Inc.', 'John Doeterte', 'Jane Doeterte', null];
		$secondary 		   = ['005142907251', 'Eiffel Tower', 'Statue of Liberty', null];
		$optional 		   = [null, null, '09112234456', null];

		foreach($method as $key => $value)
		{
			$insert["cash_in_method_name"]           		= $value;
			$insert["cash_in_method_category"]         		= $category[$key];
			$insert["cash_in_method_thumbnail"]         	= $thumbnail[$key];
			$insert["cash_in_method_currency"]         		= $currency[$key];
			$insert["cash_in_method_charge_fixed"]      	= $fix_charge[$key];
			$insert["cash_in_method_charge_percentage"]     = $percent_charge[$key];
			$insert["primary_info"]         				= $primary[$key];
			$insert["secondary_info"]         				= $secondary[$key];
			$insert["optional_info"]         				= $optional[$key];

			$check = DB::table("tbl_cash_in_method")->where("cash_in_method_name",$value)->first();

			if(!$check)
			{
				DB::table("tbl_cash_in_method")->insert($insert);
			}
		}
	}

	public static function cash_out_method_seed()
	{
		$method            = ['Banco De Oro', 'Cebuana Lhuillier', 'GCash'];
		$category          = ['bank', 'remittance', 'remittance'];
		$proc     	       = ['BDO', 'CELB', 'GCSH'];
		$thumbnail         = [
			'../../../assets/admin/payment/BDO.png',
			'../../../assets/admin/payment/cebuana-lhuillier.png',
			'../../../assets/admin/payment/GCASH.svg'];
		$currency 	       = ['PHP', 'PHP', 'PHP'];
		$method_fee    	   = [10, 20, 30];
		$withholding_tax   = [10, 10, 10];
		$min_pay_out	   = [1000, 1000, 1000];
		$service_charge    = [0,  0,  0];

		foreach($method as $key => $value)
		{
			$insert["cash_out_method_name"]           		= $value;
			$insert["cash_out_proc"]           				= $proc[$key];
			$insert["cash_out_method_category"]         	= $category[$key];
			$insert["cash_out_method_thumbnail"]         	= $thumbnail[$key];
			$insert["cash_out_method_currency"]         	= $currency[$key];
			$insert["cash_out_method_method_fee"]      		= $method_fee[$key];
			$insert["cash_out_method_withholding_tax"]     	= $withholding_tax[$key];
			$insert["minimum_payout"]     					= $min_pay_out[$key];
			$insert["cash_out_method_service_charge"]     	= $service_charge[$key];

			$check = DB::table("tbl_cash_out_method")->where("cash_out_method_name",$value)->first();

			if(!$check)
			{
				DB::table("tbl_cash_out_method")->insert($insert);
			}
		}


		for($i = 1; $i <= 31 ; $i++)
		{
			$exist = DB::table("tbl_cash_out_settings_per_date")->where("cash_out_settings_date",$i)->first();

			if(!$exist)
			{
				$insert_date["cash_out_settings_date"]  = $i;
				DB::table("tbl_cash_out_settings_per_date")->insert($insert_date);
			}
		}

		$day = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

		foreach ($day as $key => $value)
		{
			$exist = DB::table("tbl_cash_out_settings_per_day")->where("cash_out_settings_day",$value)->first();

			if(!$exist)
			{
				$insert_day["cash_out_settings_day"]  = $value;
				DB::table("tbl_cash_out_settings_per_day")->insert($insert_day);
			}
		}


		$count = DB::table("tbl_cash_out_settings")->count();
		if($count == 0)
		{
			$pasok['cash_out_settings_per_day']  = 0;
			$pasok['cash_out_settings_per_date'] = 1;
			DB::table("tbl_cash_out_settings")->insert($pasok);
		}

	}

	public static function philippines_location()
	{
		$message[100] = "";

		if(Schema::hasTable('refcitymun'))
        {
            $message[1] = "meron ng city";
        }
        else
        {
            DB::unprepared(file_get_contents('sql/refCitymun.sql'));
        }

        if(Schema::hasTable('refbrgy'))
        {
            $message[0] = "meron ng barangay";
        }
        else
        {
            DB::unprepared(file_get_contents('sql/refBrgy.sql'));
        }

        if(Schema::hasTable('refprovince'))
        {
            $message[2] = "meron ng province";
        }
        else
        {
            DB::unprepared(file_get_contents('sql/refProvince.sql'));
        }
        if(Schema::hasTable('refregion'))
        {
            $message[3] = "meron ng region";
        }
        else
        {
            DB::unprepared(file_get_contents('sql/refRegion.sql'));
        }

        // dd($message);
	}

	public static function delivery_charge()
	{
		$method_name    = ['Direct' ,'Indirect', 'Dropshipping'];
		$method_charge = [0, 0, 0];

		foreach($method_name as $key => $value)
		{
			$insert["method_name"] 	  = $value;
			$insert["method_charge"]  = $method_charge[$key];

			$check = DB::table("tbl_delivery_charge")->where("method_name",$value)->first();

			if(!$check)
			{
				DB::table("tbl_delivery_charge")->insert($insert);
			}
		}
	}

	public static function top_recruiter_seed()
	{
		$count = DB::table('tbl_top_recruiter')->count();
		if($count == 0)
		{
			$settings["slot_id"]          = 1;
            $settings["total_recruits"]   = 0;
			$settings["total_leads"]      = 0;
			$settings["date_from"]        = Carbon::now()->startofMonth()->format('Y-m-d');
            $settings["date_to"]          = Carbon::now()->endofMonth()->format('Y-m-d');
            DB::table('tbl_top_recruiter')->insert($settings);
		}
	}

	public static function other_settings_seed()
	{
		
		if(!DB::table('tbl_other_settings')->where("key","default_slot_limit")->first())
		{
			$settings["key"]            = 'default_slot_limit';
			$settings["name"]           = 'Default Slot Limit';
			$settings["value"]          = 0;
			DB::table('tbl_other_settings')->insert($settings);
		}

		if(!DB::table('tbl_other_settings')->where("key","show_slot_code")->first())
		{
			$settings["key"]          = 'show_slot_code';
			$settings["name"]          = 'Show Slot Code';
			$settings["value"]          = 1;
			DB::table('tbl_other_settings')->insert($settings);
		}
		if(!DB::table('tbl_other_settings')->where("key","show_product_code")->first())
		{
			$settings["key"]          = 'show_product_code';
			$settings["name"]          = 'Show Product Code';
			$settings["value"]          = 1;
			DB::table('tbl_other_settings')->insert($settings);
		}
		if(!DB::table('tbl_other_settings')->where("key","allow_duplicated_name")->first())
		{
			$settings["key"]          = 'allow_duplicated_name';
			$settings["name"]          = 'Allow Duplicated name';
			$settings["value"]          = 1;
			DB::table('tbl_other_settings')->insert($settings);
		}
		if(DB::table('tbl_other_settings')->where("key","allow_unique_name")->first())
		{
			DB::table('tbl_other_settings')->where("key","allow_unique_name")->delete();
		}
		
		if(!DB::table('tbl_other_settings')->where("key","register_your_slot")->first())
		{
			$settings["key"]            = 'register_your_slot';
			$settings["name"]           = 'Allow Register of Activation Code to yourself';
			$settings["value"]          = 1;
			DB::table('tbl_other_settings')->insert($settings);
		}
		if(!DB::table('tbl_other_settings')->where("key","product_activate")->first())
		{
			$settings["key"]            = 'product_activate';
			$settings["name"]           = 'Show Product Activate';
			$settings["value"]          = 1;
			DB::table('tbl_other_settings')->insert($settings);
		}
		if(!DB::table('tbl_other_settings')->where("key","membership_kit_upgrade")->first())
		{
			$settings["key"]            = 'membership_kit_upgrade';
			$settings["name"]           = 'Enable Membership Upgrade Using Kit';
			$settings["value"]          = 0;
			DB::table('tbl_other_settings')->insert($settings);
		}

		if(!DB::table('tbl_other_settings')->where("key","name_on_dropdown")->first())
		{
			$settings["key"]            = 'name_on_dropdown';
			$settings["name"]           = 'Name On Dropdown';
			$settings["value"]          = 0;
			DB::table('tbl_other_settings')->insert($settings);
		}
		if(!DB::table('tbl_other_settings')->where("key","earning_in_switch_slot")->first())
		{
			$settings["key"]            = 'earning_in_switch_slot';
			$settings["name"]           = 'Earning In Switch Slot Page';
			$settings["value"]          = 0;
			DB::table('tbl_other_settings')->insert($settings);
		}
		
		if(!DB::table('tbl_other_settings')->where("key","tin_settings")->first())
		{
			$settings["key"]            = 'tin_settings';
			$settings["name"]           = 'Tin On/Off';
			$settings["value"]          = 1;
			DB::table('tbl_other_settings')->insert($settings);
		}

		if(!DB::table('tbl_other_settings')->where("key","registration_with_activation")->first())
		{
			$settings["key"]            = 'registration_with_activation';
			$settings["name"]           = 'Registration Form with Code and Pin';
			$settings["value"]          = 1;
			DB::table('tbl_other_settings')->insert($settings);
		}
	}
	public static function investment_amount()
	{
		if(!DB::table('tbl_investment_amount')->where("min_amount","1000")->first())
		{
			$insert['min_amount']			= 1000;
			$insert['max_amount']			= 1000;
			DB::table('tbl_investment_amount')->insert($insert);
		}
	}
	public static function island_group()
	{
		if(!DB::table('tbl_island_group')->where("island_group","Luzon")->first())
		{
			$island_group            	= ['Metro-Manila','Luzon', 'Visayas', 'Mindanao'];

			foreach ($island_group as $key => $value) 
			{
				$insert['island_group'] = $value;
				DB::table('tbl_island_group')->insert($insert);
			}
		}		
	}
	
}
