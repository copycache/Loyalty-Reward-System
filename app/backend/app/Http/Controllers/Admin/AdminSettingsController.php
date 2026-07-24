<?php
namespace App\Http\Controllers\Admin;

use App\Models\Tbl_membership;
use App\Models\Tbl_currency;
use App\Models\Tbl_other_settings;
use App\Models\Tbl_income_limit_settings;

use App\Globals\Seed;

use Request;
use DB;
class AdminSettingsController extends AdminController
{
	public function seed()
	{
		Seed::other_settings_seed();
	}

	public function codevault()
	{
		$data["show_slot_code"]       = Tbl_other_settings::where("key","show_slot_code")->first()->value;
		$data["show_product_code"]	  = Tbl_other_settings::where("key","show_product_code")->first()->value;
		$data["membership_kit_upgrade"]	 = Tbl_other_settings::where("key","membership_kit_upgrade")->first()->value;

		return Response()->json($data);
	}

	public function codevault_update()
	{
		Tbl_other_settings::where('key',"show_slot_code")->update(["value"=>Request::input("show_slot_code")]);
		Tbl_other_settings::where('key',"show_product_code")->update(["value"=>Request::input("show_product_code")]);
		Tbl_other_settings::where('key',"membership_kit_upgrade")->update(["value"=>Request::input("membership_kit_upgrade")]);


		$data["show_slot_code"]      = Tbl_other_settings::where("key","show_slot_code")->first()->value;
		$data["show_product_code"]	 = Tbl_other_settings::where("key","show_product_code")->first()->value;
		$data["membership_kit_upgrade"]	 = Tbl_other_settings::where("key","membership_kit_upgrade")->first()->value;

		return Response()->json($data);
	}

	public function codeactivate()
	{
		$data["register_on_slot"]    = Tbl_other_settings::where("key","register_on_slot")->first()->value;
		$data["register_your_slot"]	 = Tbl_other_settings::where("key","register_your_slot")->first()->value;
		$data["product_activate"]	 = Tbl_other_settings::where("key","product_activate")->first()->value;
		$data["name_on_dropdown"]	 = Tbl_other_settings::where("key","name_on_dropdown")->first()->value;

		return Response()->json($data);
	}

	public function codeactivate_update()
	{
		Tbl_other_settings::where('key',"register_on_slot")->update(["value"=>Request::input("register_on_slot")]);
		Tbl_other_settings::where('key',"register_your_slot")->update(["value"=>Request::input("register_your_slot")]);
		Tbl_other_settings::where('key',"product_activate")->update(["value"=>Request::input("product_activate")]);
		Tbl_other_settings::where('key',"name_on_dropdown")->update(["value"=>Request::input("name_on_dropdown")]);

		$data["register_on_slot"]    = Tbl_other_settings::where("key","register_on_slot")->first()->value;
		$data["register_your_slot"]	 = Tbl_other_settings::where("key","register_your_slot")->first()->value;
		$data["product_activate"]	 = Tbl_other_settings::where("key","product_activate")->first()->value;
		$data["name_on_dropdown"]    = Tbl_other_settings::where("key","name_on_dropdown")->first()->value;

		return Response()->json($data);
	}

	public function slot()
	{
		$data["default_slot_limit"]     = Tbl_other_settings::where("key","default_slot_limit")->first()->value;

		return Response()->json($data);
	}

	public function slot_update()
	{
		Tbl_other_settings::where('key',"default_slot_limit")->update(["value"=>Request::input("default_slot_limit")]);


		$data["default_slot_limit"]     = Tbl_other_settings::where("key","default_slot_limit")->first()->value;

		return Response()->json($data);
	}

	public function registration()
	{
		$data["allow_duplicated_name"]  = Tbl_other_settings::where("key","allow_duplicated_name")->first()->value;

		return Response()->json($data);
	}

	public function registration_update()
	{
		Tbl_other_settings::where('key',"allow_duplicated_name")->update(["value"=>Request::input("allow_duplicated_name")]);

		$data["allow_duplicated_name"]  = Tbl_other_settings::where("key","allow_duplicated_name")->first()->value;

		return Response()->json($data);
	}

	public function load_shipping_info()
	{
		$check = DB::table('tbl_shipping_fee_matrix')->first();
		if(!$check)
		{
			$insert["shipping_fee_increment"] = 1;
			$insert["shipping_fee_increment_amount"] = 0;
			$insert["shipping_fee_matrix_start_amount"] = 0;
			DB::table('tbl_shipping_fee_matrix')->insert($insert);
		}
		$data = DB::table('tbl_shipping_fee_matrix')->first();
		return Response()->json($data);
	}

	public function manage_shipping_fee()
	{
		$id = Request::input("shipping_fee_matrix_id");
        $update["shipping_fee_increment"] = Request::input("shipping_fee_increment");
        $update["shipping_fee_increment_amount"] = Request::input("shipping_fee_increment_amount");
        $update["shipping_fee_matrix_start_amount"] = Request::input("shipping_fee_matrix_start_amount");
		DB::table('tbl_shipping_fee_matrix')->where("shipping_fee_matrix_id",$id)->update($update);
		// return Response()->json($data);
	}

	public function load_tin_settings()
	{
		$data["tin_settings"]        = Tbl_other_settings::where("key","tin_settings")->first()->value;
		return Response()->json($data);
	}

	public function update_tin_settings()
	{
		// dd(Request::input());
		Tbl_other_settings::where('key',"tin_settings")->update(["value"=>Request::input("tin_settings")]);

		$data["tin_settings"]  = Tbl_other_settings::where("key","tin_settings")->first()->value;
		return Response()->json($data);
	}
		
}
