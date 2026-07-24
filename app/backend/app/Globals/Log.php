<?php
namespace App\Globals;

use App\Models\Tbl_points_log;
use App\Models\Tbl_wallet_log;
use App\Models\Tbl_earning_log;
use App\Models\Tbl_currency;
use App\Models\Tbl_slot;
use App\Models\Tbl_binary_points;
use App\Models\Tbl_unilevel_points;
use App\Models\Tbl_override_points;
use App\Models\Tbl_flushout_log;
use App\Models\Tbl_income_limit_settings;
use App\Models\Tbl_income_limit_flushout_logs;

use Carbon\Carbon;

use App\Globals\Wallet;

class Log
{
	public static function insert_wallet($slot_id, $amount, $plan, $currency_id = 0, $transaction_id = null, $date = null)
	{
		// Validate inputs
		if (!$slot_id || $amount === null || $plan == '') {
			return 0;
		}

		// Apply income limit logic
		$amount = Self::income_limit($slot_id, $amount);

		// Get default currency if not specified
		if ($currency_id == 0) {
			$currency_default = Tbl_currency::where("currency_default", 1)->first();
			$currency_id = $currency_default ? $currency_default->currency_id : null;
		}

		// Determine entry type
		$entry = $amount >= 0 ? "DEBIT" : "CREDIT";

		// Calculate current running balance for this slot and currency
		$running_balance = Tbl_wallet_log::where("wallet_log_slot_id", $slot_id)
			->where("currency_id", $currency_id)
			->sum("wallet_log_amount");

		// Prepare insert data
		$insert = [
			"wallet_log_slot_id"         => $slot_id,
			"wallet_log_amount"          => $amount,
			"wallet_log_details"         => trim(preg_replace('/_/', ' ', $plan)),
			"wallet_log_type"            => $entry,
			"wallet_log_running_balance" => $running_balance + $amount,
			"wallet_log_date_created"    => $date ? $date : Carbon::now(),
			"transaction_id"             => $transaction_id,
			"currency_id"                => $currency_id,
		];

		// Skip inserting zero-amount BINARY logs
		if ($amount == 0 && strtoupper($plan) == "BINARY") {
			return 0;
		}

		// Insert only if amount is not zero
		if ($amount != 0) {
			$wallet_log_id = Tbl_wallet_log::insertGetId($insert);
			Wallet::update_wallet($slot_id,$amount,$currency_id);

			return $wallet_log_id;
		}

		return 0;
	}


	public static function insert_earnings(
		$slot_id,
		$amount,
		$plan,
		$entry,
		$cause_id,
		$details,
		$level = 0,
		$currency_id = 0,
		$date = null
	)
	{
		// ✅ Basic validation
		if (!$slot_id || $amount === null || $plan == '' || $entry == '') {
			return 0;
		}

		// ✅ Get default currency if not provided
		if ($currency_id == 0) {
			$currency_default = Tbl_currency::where("currency_default", 1)->first();
			$currency_id = $currency_default ? $currency_default->currency_id : 0;
		}

		// ✅ Get cause info if applicable
		$cause_info = null;
		if ($cause_id) {
			$cause_info = Tbl_slot::where("slot_id", $cause_id)->first();
		}

		// ✅ Prepare earning log data
		$insert_earning = [
			"earning_log_slot_id"             => $slot_id,
			"earning_log_amount"              => $amount,
			"earning_log_plan_type"           => trim(preg_replace('/_/', ' ', $plan)),
			"earning_log_entry_type"          => $entry,
			"earning_log_cause_id"            => $cause_id,
			"earning_log_cause_membership_id" => $cause_info ? ($cause_info->slot_membership ?: null) : null,
			"earning_log_cause_level"         => $level,
			"earning_log_date_created"        => $date ? $date : Carbon::now(),
			"earning_log_currency_id"         => $currency_id,
		];

		// ✅ Skip zero-amount BINARY logs
		if ($amount == 0 && strtoupper($plan) == "BINARY") {
			return 0;
		}

		// ✅ Insert only if amount is not zero
		if ($amount != 0) {
			return Tbl_earning_log::insertGetId($insert_earning);
		}

		return 0;
	}

	public static function insert_points($slot_id, $amount, $type, $cause_id, $level = 0)
	{
		// ✅ Basic validation
		if (!$slot_id || $amount === null || $type == '') {
			return 0;
		}

		// ✅ Fetch cause slot (if applicable)
		$cause_info = null;
		if ($cause_id) {
			$cause_info = Tbl_slot::where("slot_id", $cause_id)->first();
		}

		// ✅ Compute running balance for this slot and type
		$running_balance = Tbl_points_log::where("points_log_type", $type)
			->where("points_log_slot_id", $slot_id)
			->sum("points_log_amount") + $amount;

		// ✅ Determine if debit or credit
		$balance_type = $amount >= 0 ? "Debit" : "Credit";

		// ✅ Prepare insert data
		$insert = [
			"points_log_slot_id"              => $slot_id,
			"points_log_amount"               => $amount,
			"points_log_type"                 => $type,
			"points_log_cause_id"             => $cause_id,
			"points_log_cause_membership_id"  => $cause_info ? $cause_info->slot_membership : null,
			"points_log_cause_level"          => $level,
			"points_log_date_created"         => Carbon::now(),
			"running_balance"                 => $running_balance,
			"balance_type"                    => $balance_type,
		];

		// ✅ Insert only if amount is not zero
		if ($amount != 0) {
			return Tbl_points_log::insertGetId($insert);
		}

		return 0;
	}

	public static function insert_unilevel_points($slot_id, $amount, $type, $cause_id, $level = 0, $item_id = null)
	{
		// ✅ Basic validation
		if (!$slot_id || $amount === null || $type == '') {
			return 0;
		}

		// ✅ Fetch cause slot (if applicable)
		$cause_info = null;
		if ($cause_id) {
			$cause_info = Tbl_slot::where("slot_id", $cause_id)->first();
		}

		// ✅ Prepare insert data
		$insert = [
			"unilevel_points_slot_id"              => $slot_id,
			"unilevel_points_amount"               => $amount,
			"unilevel_points_type"                 => $type,
			"unilevel_points_cause_id"             => $cause_id,
			"unilevel_points_cause_membership_id"  => $cause_info ? $cause_info->slot_membership : null,
			"unilevel_points_cause_level"          => $level,
			"unilevel_item_id"                     => $item_id,
			"unilevel_points_date_created"         => Carbon::now(),
		];

		// ✅ Only insert if amount is not zero
		if ($amount != 0) {
			return Tbl_unilevel_points::insertGetId($insert);
		}

		return 0;
	}

	public static function insert_override_points($slot_id, $amount)
	{
		// ✅ Basic validation
		if (!$slot_id || $amount === null) {
			return 0;
		}

		// ✅ Prepare insert data
		$insert = [
			"slot_id"                       => $slot_id,
			"override_amount"               => $amount,
			"distributed"                   => 0,
			"override_points_date_created"  => Carbon::now(),
		];

		// ✅ Only insert if amount is not zero
		if ($amount != 0) {
			return Tbl_override_points::insertGetId($insert);
		}

		return 0;
	}

	public static function insert_binary_points(
		$slot_id,
		$receive,
		$old,
		$new,
		$cause_id,
		$log_earnings,
		$log_flushout,
		$level,
		$trigger,
		$gc_gained = 0,
		$flushout_points,
		$date = null,
		$projected_income = 0
	) {
		// ✅ Basic validation
		if (!$slot_id || !$cause_id || !is_array($receive) || !is_array($old) || !is_array($new)) {
			return 0;
		}

		// ✅ Fetch cause info safely
		$cause_info = Tbl_slot::where("slot_id", $cause_id)->first();

		// ✅ Prepare insert data
		$insert = [
			"binary_points_slot_id"            => $slot_id,
			"binary_receive_left"              => $receive["left"] ?? 0,
			"binary_receive_right"             => $receive["right"] ?? 0,
			"binary_old_left"                  => $old["left"] ?? 0,
			"binary_old_right"                 => $old["right"] ?? 0,
			"binary_new_left"                  => $new["left"] ?? 0,
			"binary_new_right"                 => $new["right"] ?? 0,
			"binary_points_income"             => $log_earnings,
			"binary_points_projected_income"   => $projected_income,
			"binary_points_flushout"           => $log_flushout,
			"binary_points_trigger"            => $trigger,
			"binary_cause_slot_id"             => $cause_info ? $cause_info->slot_id : null,
			"binary_cause_membership_id"       => $cause_info ? $cause_info->slot_membership : null,
			"binary_cause_level"               => $level,
			"binary_points_date_received"      => $date ? $date : Carbon::now(),
			"gc_gained"                        => $gc_gained,
			"flushout_points_left"             => $flushout_points["left"] ?? 0,
			"flushout_points_right"            => $flushout_points["right"] ?? 0,
		];

		// ✅ Insert data
		return Tbl_binary_points::insertGetId($insert);
	}


	public static function get_earning_amount($slot_id)
	{
		$amount = Tbl_earning_log::where("earning_log_slot_id",$slot_id)->sum("earning_log_amount");

		return $amount;
	}
	
	public static function flushout_logs($amount,$log_id)
	{
		$insert["flushout_amount"]    = $amount;
		$insert["from_wallet_log_id"] = $log_id; 
		Tbl_flushout_log::insert($insert);
	}

	public static function income_limit($slot_id,$amount)
	{
		$check = Tbl_income_limit_settings::first() ? Tbl_income_limit_settings::first()->income_limit_status : 'disable';

		if($check == 'enable') {
			
			$settings = Tbl_income_limit_settings::first();
			if($settings->income_limit_cycle == 'daily') {

				$date_from = Carbon::now()->startofday();
				$date_to   = Carbon::now()->endofday();
				$total_amount  =  Tbl_earning_log::where('earning_log_slot_id',$slot_id)->whereDate("earning_log_date_created",">=",$date_from)->whereDate("earning_log_date_created","<=",$date_to)->sum('earning_log_amount');

			}
			else if($settings->income_limit_cycle == 'weekly') {

				$date_from = Carbon::now()->startofweek();
				$date_to   = Carbon::now()->endofweek();
				$total_amount  =  Tbl_earning_log::where('earning_log_slot_id',$slot_id)->whereDate("earning_log_date_created",">=",$date_from)->whereDate("earning_log_date_created","<=",$date_to)->sum('earning_log_amount');

			}
			else if($settings->income_limit_cycle == 'monthly') {

				$date_from = Carbon::now()->startofmonth();
				$date_to   = Carbon::now()->endofmonth();
				$total_amount  =  Tbl_earning_log::where('earning_log_slot_id',$slot_id)->whereDate("earning_log_date_created",">=",$date_from)->whereDate("earning_log_date_created","<=",$date_to)->sum('earning_log_amount');

			}
			else {

				$total_amount  =  Tbl_earning_log::where('earning_log_slot_id',$slot_id)->sum('earning_log_amount');

			}

			if($settings->income_limit != 0){

				
				if($total_amount < $settings->income_limit) {

					$new_total_amount = $total_amount + $amount;

					if($new_total_amount > $settings->income_limit) {

						$diff  = $new_total_amount - $settings->income_limit;
						$new_amount = $amount - $diff;
						Self::income_limit_flushout_logs($slot_id,$diff);
					}
					else {

						$new_amount =  $amount;

					}
				}
				else {

					$new_amount =  0;
				}
			}
					
		}
		else {

			$new_amount =  $amount;
		}


		// dd($amount,$new_amount);
		return $new_amount;
	}
	
	public static function income_limit_flushout_logs($slot_id,$amount)
	{
		$insert["flushout_income_amount"]    = $amount;
		$insert["flushout_income_slot_id"]   = $slot_id; 
		Tbl_income_limit_flushout_logs::insert($insert);
	}

}