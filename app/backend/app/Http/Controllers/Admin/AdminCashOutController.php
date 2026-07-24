<?php
namespace App\Http\Controllers\Admin;

use App\Globals\CashOut;

use Request;
use Hash;
use Excel;
use App\Globals\Slot;
use App\Globals\Log;
use App\Globals\Audit_trail;
use DB;
use Carbon\Carbon;
class AdminCashOutController extends AdminController
{
	public function get_settings()
	{
		$response = CashOut::get_settings();
		return response()->json($response);
	}

	public function update_settings()
	{
		$response = CashOut::update_settings(Request::all());
		return response()->json($response);
	}
	public function get_transactions()
    {
        $response = CashOut::get_transactions(Request::input(), Request::input('slot_id'),null,"member_cashout");

        return response()->json($response);
    }

	public function get_method_list() 
    {
        if(Request::input())
        {
            $response = CashOut::get_method_list(Request::input('category'), Request::input('currency'));
        }
        else
        {
            $response = CashOut::get_method_list(null, null, true);
        }

        return response()->json($response);
    }

    public function update_method() 
	{
	    $response = CashOut::update_method(Request::input());

	    return response()->json($response);
	}

	public function add_new_method() 
	{

	    $response = CashOut::add_new_method(Request::input());

	    return response()->json($response);
	}

	public function archive_method() 
	{
	    $response = CashOut::archive_method(Request::input('cash_out_method_id'), Request::input('archive'));

	    return response()->json($response);
	}

	public function check_schedule() 
	{
	    $response = CashOut::check_schedule(Request::input());

	    return response()->json($response);
	}

	public function check_schedule_details() 
	{
	    $response = CashOut::check_schedule_details(Request::input());

	    return response()->json($response);
	}

	public function process_payout()
	{
		$response = CashOut::process_payout(Request::input());

		return response()->json($response);
	}

	public function get_schedules()
	{
		$response = CashOut::get_schedules(Request::input());

		return response()->json($response);
	}

	public function update_transaction()
	{
		$response = CashOut::update_transaction(Request::input());

		return response()->json($response);
	}

	public function update_message()
	{
		$response = CashOut::update_message(Request::input());

		return response()->json($response);
	}

	// public function process_transaction()
	// {
	// 	$response = CashOut::process_transaction(Request::input('cash_out_id'), Request::input('sched_id'));

	// 	return response()->json($response);
	// }

	public function process_transactions()
	{
		$response = CashOut::process_transactions(Request::input('sched_id'),Request::input('type'));
		return response()->json($response);
	}

	public function check_negatives()
	{
		$response = CashOut::check_negatives(Request::input());
		return response()->json($response);
	}

	public function get_actual_schedule_transactions()
	{
		$response = CashOut::get_actual_schedule_transactions(Request::input());

		return response()->json($response);
	}

	public function get_method_list_raw() 
    {
		$response = CashOut::get_method_list_raw();

        return response()->json($response);
	}
	
}
