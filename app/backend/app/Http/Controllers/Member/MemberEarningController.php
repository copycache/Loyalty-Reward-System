<?php
namespace App\Http\Controllers\Member;
use App\Http\Controllers\Controller;
use App\Models\Tbl_binary_points_settings;
use App\Models\Tbl_dropshipping_bonus_logs;
use App\Models\Tbl_orders;
use Request;
use DB;
use Carbon\Carbon;
use App\Globals\Plan;

use App\Models\Tbl_slot;
use App\Models\Tbl_earning_log;
use App\Models\Tbl_wallet_log;
use App\Models\Tbl_mlm_unilevel_settings;
use App\Models\Tbl_membership;
use App\Models\Tbl_binary_points;
use App\Models\Tbl_unilevel_points;
use App\Models\Tbl_mlm_plan;
use App\Models\Tbl_unilevel_distribute;
use App\Models\Tbl_dynamic_compression_record;
use App\Models\Tbl_label;
use App\Models\Tbl_binary_projected_income_log;

use stdClass;

class MemberEarningController extends Controller
{
    function __construct()
    {

    }

    public function get()
    {

        $plan     = Request::input("plan");
        $response = Plan::get($plan);
        return response()->json($response, 200);
    }

    public function get_initial()
    {
        $ok          = [];
        $initial     = Tbl_mlm_plan::where('mlm_plan_enable', 1 )->first()->mlm_plan_code;
        $response['initial']    = trim(strtolower ($initial));
        $response['is_dynamic_com']    = Tbl_mlm_unilevel_settings::first()->is_dynamic;

        $slot        = Tbl_slot::where("slot_owner",Request::user()->id)->where("slot_id",Request::input("current_slot_id"))->first()->slot_id;
        $plan_enable = Tbl_mlm_plan::where('mlm_plan_enable', 1 )->get();
        foreach ($plan_enable as $key => $plan_name)
        {
            $new_plan_name = trim(preg_replace('/_/', ' ', $plan_name->mlm_plan_code));
            if($new_plan_name == 'UNILEVEL')
            {
                if($response['is_dynamic_com'] == 'dynamic')
                {
                    $new_plan_name = "UNILEVEL COMMISSION";
                }
            }        
            $running_balance  = Tbl_earning_log::where("earning_log_slot_id",$slot)->where("earning_log_plan_type",$new_plan_name)
                                                    ->sum("earning_log_amount");

            if($plan_name->mlm_plan_code != 'UNILEVEL') 
            {
                $ok += ["$plan_name->mlm_plan_code" => number_format($running_balance,2)];
            }                                           
            else if($plan_name->mlm_plan_code == 'UNILEVEL')
            {
                if($response['is_dynamic_com'] == 'dynamic')
                {
                    $running_balance    =   Tbl_wallet_log::where("wallet_log_details","UNILEVEL COMMISSION")->where("wallet_log_slot_id",$slot)->sum("wallet_log_amount");
                    $ok                 += ["$plan_name->mlm_plan_code" => number_format($running_balance,2)];
                    
                }
                else
                {
                    $running_balance    =   Tbl_wallet_log::where("wallet_log_details","UNILEVEL")->where("wallet_log_slot_id",$slot)->sum("wallet_log_amount");
                    $ok                 += ["$plan_name->mlm_plan_code" => number_format($running_balance,2)];
                }

            }
        }
        $response['total']  = $ok;
        // dd($response['total']);
        return response()->json($response, 200);
    }

    public function user_data()
    {
    	return Request::user();
    }

    public function direct_earning()
    {
        $slot                    = Tbl_slot::where("slot_owner",Request::user()->id)->where("slot_id",Request::input("current_slot_id"))->first();
        $data                    = null;
        $running_balance         = 0;

        if($slot)
        {

            $log = Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)
                                    ->leftJoin("tbl_slot","tbl_slot.slot_id","=","tbl_earning_log.earning_log_cause_id")
                                    ->leftJoin("users","users.id","=","tbl_slot.slot_owner")
                                    ->leftJoin("tbl_membership","tbl_membership.membership_id","=","tbl_earning_log.earning_log_cause_membership_id")
                                    ->where("earning_log_plan_type","DIRECT")
                                    ->leftJoin("tbl_label","tbl_label.plan_code","=","tbl_earning_log.earning_log_plan_type")
                                    ->select("*",DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%m/%d/%Y') as earning_log_date_created"),
                                                 DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%h:%i %p') as earning_log_time_created"))
                                    ->paginate(10);

            $data["log"] = $log;
            $running_balance = Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)->where("earning_log_plan_type","DIRECT")->sum("earning_log_amount");
        }

        $data["total"]  = number_format($running_balance,2);

        return json_encode($data);
    }

    public function direct_gc_earning()
    {
        $slot                    = Tbl_slot::where("slot_owner",Request::user()->id)->where("slot_id",Request::input("current_slot_id"))->first();
        $data                    = null;
        $running_balance         = 0;

        if($slot)
        {

            $log = Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)
                                    ->leftJoin("tbl_slot","tbl_slot.slot_id","=","tbl_earning_log.earning_log_cause_id")
                                    ->leftJoin("users","users.id","=","tbl_slot.slot_owner")
                                    ->leftJoin("tbl_membership","tbl_membership.membership_id","=","tbl_earning_log.earning_log_cause_membership_id")
                                    ->where("earning_log_plan_type","DIRECT GC")
                                    ->leftJoin("tbl_label","tbl_label.plan_code","=","tbl_earning_log.earning_log_plan_type")
                                    ->select("*",DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%m/%d/%Y') as earning_log_date_created"),
                                                 DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%h:%i %p') as earning_log_time_created"))
                                    ->paginate(10);

            $data["log"] = $log;
            $running_balance = Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)->where("earning_log_plan_type","DIRECT GC")->sum("earning_log_amount");
        }

        $data["total"]  = number_format($running_balance,2);

        return json_encode($data);
    }

    public function direct_bonus_earning()
    {
        $slot                    = Tbl_slot::where("slot_owner",Request::user()->id)->where("slot_id",Request::input("current_slot_id"))->first();
        $data                    = null;
        $running_balance         = 0;

        if($slot)
        {

            $log = Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)
                                    ->leftJoin("tbl_slot","tbl_slot.slot_id","=","tbl_earning_log.earning_log_cause_id")
                                    ->leftJoin("users","users.id","=","tbl_slot.slot_owner")
                                    ->leftJoin("tbl_membership","tbl_membership.membership_id","=","tbl_earning_log.earning_log_cause_membership_id")
                                    ->where("earning_log_plan_type","DIRECT BONUS")
                                    ->leftJoin("tbl_label","tbl_label.plan_code","=","tbl_earning_log.earning_log_plan_type")
                                    ->select("*",DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%m/%d/%Y') as earning_log_date_created"),
                                                 DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%h:%i %p') as earning_log_time_created"))
                                    ->paginate(10);

            $data["log"] = $log;
            $running_balance = Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)->where("earning_log_plan_type","DIRECT BONUS")->sum("earning_log_amount");
        }

        $data["total"]  = number_format($running_balance,2);

        return json_encode($data);
    }

    public function indirect_earning()
    {
        $slot                    = Tbl_slot::where("slot_owner",Request::user()->id)->where("slot_id",Request::input("current_slot_id"))->first();
        $data                    = null;
        $running_balance         = 0;
        $log                     = null;
        $ctr                     = 0;
        $points_left             = 0;
        $points_right            = 0;
        if($slot)
        {
            $membership                            = Tbl_membership::where("membership_id",$slot->slot_membership)->first();
            if($membership)
            {
                $membership->membership_indirect_level = $membership->membership_indirect_level + 1;


                $level = 0;
                while($membership->membership_indirect_level >= $level)
                {
                    $log[$ctr]["level_name"]         = $this->ordinal($level);
                    $log[$ctr]["number_of_slots"]    = Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)->where("earning_log_plan_type","INDIRECT")->where("earning_log_cause_level",$level)->count() ? Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)->where("earning_log_cause_level",$level)->where("earning_log_plan_type","INDIRECT")->count()." Slot(s)" : "No Slots";
                    $log[$ctr]["last_slot_creation"] = Tbl_earning_log::join('tbl_tree_sponsor','tbl_tree_sponsor.sponsor_parent_id','=','tbl_earning_log.earning_log_slot_id')->where('sponsor_level', $level)->where("earning_log_slot_id",$slot->slot_id)->where("earning_log_plan_type","INDIRECT")->first() ? Carbon::parse(Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)->orderBy("earning_log_date_created","DESC")->where("earning_log_plan_type","INDIRECT")->first()->earning_log_date_created)->format("m/d/Y") : "---";
                    $log[$ctr]["earnings"]           = Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)->where("earning_log_plan_type","INDIRECT")->where("earning_log_cause_level",$level)->sum("earning_log_amount");

                    $running_balance = $running_balance + $log[$ctr]["earnings"];
                    $ctr++;
                    $level++;
                }
            }
        }

        $data["log"]    = $log;
        $data["total"]  = number_format($running_balance,2);
        return json_encode($data);
    }

    public function indirect_details()
    {
        $slot = Tbl_slot::where("slot_owner",Request::user()->id)->where("slot_id",Request::input("current_slot_id"))->first();
        $level = Request::input('index');

        $data = Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)
                    ->where("earning_log_plan_type","INDIRECT")
                    ->where("earning_log_cause_level",$level)
                    ->leftJoin("tbl_slot","tbl_slot.slot_id","=","tbl_earning_log.earning_log_cause_id")
                    ->leftJoin("users","users.id","=","tbl_slot.slot_owner")
                    ->paginate(10);
                    
        return json_encode($data);
    }

    public function binary_earning()
    {
        $binary_settings         = DB::table("tbl_binary_settings")->first();
        $cycle                   = DB::table("tbl_binary_settings")->first() ? DB::table("tbl_binary_settings")->first()->cycle_per_day : 1;
        $slot                    = Tbl_slot::where("slot_owner",Request::user()->id)->where("slot_id",Request::input("current_slot_id"))->JoinMembership()->first();
        $log                     = null;
        $running_balance         = 0;
        $points_left             = 0;
        $points_right            = 0;
        if($slot)
        {
            $log = Tbl_binary_points::where("binary_points_slot_id",$slot->slot_id)
                                    ->leftJoin("tbl_membership as membership","membership.membership_id","=","tbl_binary_points.binary_cause_membership_id")
                                    ->leftJoin("tbl_slot as cause_slot","cause_slot.slot_id","=","tbl_binary_points.binary_cause_slot_id")
                                    ->select("tbl_binary_points.*","membership.membership_name as membership_name","cause_slot.slot_no as cause_no",
                                                 DB::raw("DATE_FORMAT(tbl_binary_points.binary_points_date_received, '%M %d, %Y') as binary_log_date_created"),
                                                 DB::raw("DATE_FORMAT(tbl_binary_points.binary_points_date_received, '%h:%i %p') as binary_log_time_created"))
                                    ->orderBy('binary_points_id', 'desc')
                                    ->paginate(10);


            $running_balance = Tbl_binary_points::where("binary_points_slot_id",$slot->slot_id)->sum("binary_points_income");
        }
        
        $data['todays_pairs']  = Tbl_earning_log::where('earning_log_slot_id',$slot->slot_id)->where('earning_log_plan_type','=','BINARY');
        if($binary_settings->cycle_per_day == 1)
        {
            $today = Carbon::now()->format('Y-m-d');
            if($binary_settings->binary_limit_type == 1) {
                if($slot->binary_realtime_commission) {
                    $data['todays_pairs'] = $data['todays_pairs']->wheredate('earning_log_date_created',$today)->count();
                } else {
                    $data['todays_pairs'] = Tbl_binary_projected_income_log::where('slot_id', $slot->slot_id)->wheredate('date_created',$today)->count();
                }
            } else if($binary_settings->binary_limit_type == 2) {
                if($slot->binary_realtime_commission) {
                    $data['todays_pairs'] = $data['todays_pairs']->wheredate('earning_log_date_created',$today)->sum('earning_log_amount');
                } else {
                    $data['todays_pairs'] = Tbl_binary_projected_income_log::where('slot_id', $slot->slot_id)->wheredate('date_created',$today)->sum('wallet_amount');
                }
            }

        }
        else if($binary_settings->cycle_per_day == 2)
        {
            // Get the current date and time
            $currentDate = Carbon::now();
            $todayStart = $currentDate->copy()->startOfDay();
            $todayNoon = Carbon::createFromFormat('Y-m-d H:i:s', $currentDate->format('Y-m-d') . ' 12:00:00');
            $todayEnd = Carbon::createFromFormat('Y-m-d H:i:s', $currentDate->format('Y-m-d') . ' 23:59:59');
            // dd($todayStart, $todayNoon);
            // Count or sum pairs based on the time of day
            if ($currentDate->format('A') == "AM") {
                // Morning logs: from the start of the day until noon
                if ($binary_settings->binary_limit_type == 1) {
                    $data['todays_pairs'] = $data['todays_pairs']
                        ->where('earning_log_date_created', '>=', $todayStart)
                        ->where('earning_log_date_created', '<=', $todayNoon)
                        ->count();
                } else if ($binary_settings->binary_limit_type == 2) {
                    $data['todays_pairs'] = $data['todays_pairs']
                        ->where('earning_log_date_created', '>=', $todayStart)
                        ->where('earning_log_date_created', '<=', $todayNoon)
                        ->sum('earning_log_amount');
                }
            } else {
                // Afternoon logs: from noon until the end of the day
                if ($binary_settings->binary_limit_type == 1) {
                    $data['todays_pairs'] = $data['todays_pairs']
                        ->where('earning_log_date_created', '>', $todayNoon)
                        ->where('earning_log_date_created', '<=', $todayEnd)
                        ->count();
                } else if ($binary_settings->binary_limit_type == 2) {
                    $data['todays_pairs'] = $data['todays_pairs']
                        ->where('earning_log_date_created', '>', $todayNoon)
                        ->where('earning_log_date_created', '<=', $todayEnd)
                        ->sum('earning_log_amount');
                }
            }
        }
        else if($binary_settings->cycle_per_day == 3)
        {
            $start = Carbon::now()->startofWeek();
            $end = Carbon::now()->endofWeek();
            if($binary_settings->binary_limit_type == 1) {
                $data['todays_pairs'] = $data['todays_pairs']->wheredate('earning_log_date_created',">=",$start)->wheredate('earning_log_date_created',"<=",$end)->count();
            } else if($binary_settings->binary_limit_type == 2) {
                $data['todays_pairs'] = $data['todays_pairs']->wheredate('earning_log_date_created',">=", $start)->wheredate('earning_log_date_created',"<=",$end)->sum('earning_log_amount');
            }
        }
        else if($binary_settings->cycle_per_day == 4)
        {
            if($binary_settings->binary_limit_type == 1) {
                $data['todays_pairs'] = $data['todays_pairs']->count();
           
            } else if($binary_settings->binary_limit_type == 2) {
                $data['todays_pairs'] = $data['todays_pairs']->sum('earning_log_amount');
            }
        }
        $data['todays_pairs'] = round($data['todays_pairs'], 2);

        if($binary_settings->binary_limit_type == 1) {
            $data['max_pairs']      =  Tbl_slot::where('slot_id',$slot->slot_id)->JoinMembership()->first() ? Tbl_slot::where('slot_id',$slot->slot_id)->JoinMembership()->first()->membership_pairings_per_day :  0;
        } else if($binary_settings->binary_limit_type == 2) {
            $data['max_pairs']      =  Tbl_slot::where('slot_id',$slot->slot_id)->JoinMembership()->first() ? Tbl_slot::where('slot_id',$slot->slot_id)->JoinMembership()->first()->max_earnings_per_cycle : 0;
        }
        if($data['todays_pairs'] <= $data['max_pairs'] )
        {
            $data['remarks'] = 'ok';
        }
        else
        {
            $data['remarks'] = 'nah';
        }

        $direct_status = [];

        if($binary_settings->binary_required_direct_enable) {

            $count_direct = Tbl_slot::where("slot_sponsor", $slot->slot_id)->count();
            $direct_required = Tbl_membership::where("membership_id", $slot->slot_membership)->value('binary_required_direct');
            $direct_status["count_direct"] = $count_direct;
            $direct_status["direct_required"] = $direct_required;
            if($count_direct >= $direct_required) {
                $direct_status["qualified"] = 1;
            } else {
                $direct_status["qualified"] = 0;
            }
        } else {

        }

        $data["log"]           = $log;
        $data["direct_status"]  = $direct_status;
        $data["total_running"] = $running_balance;
        //dd($data);
        return json_encode($data);
    }

    public function binary_points()
    {
        $binary_settings         = DB::table("tbl_binary_settings")->first();
        $slot_id = Request::input('current_slot_id');
        $history_type = Request::input('history_type');
        if($history_type == "per_level") {
            $slot = Tbl_slot::where('slot_id', $slot_id)->joinMembership()->first();
            $response['data'] = Tbl_binary_points::where('binary_points_slot_id', $slot_id)
                                ->groupBy('binary_cause_level')
                                ->select(
                                    'binary_cause_level',
                                    DB::raw("SUM(binary_receive_left) as left_points"),
                                    DB::raw("SUM(binary_receive_right) as right_points"),
                                    DB::raw("SUM(binary_points_income) as earnings"),
                                    DB::raw("COUNT(CASE WHEN binary_points_income > 0 THEN 1 ELSE NULL END) as total_pairs"),
                                    DB::raw("COUNT(binary_points_slot_id) as slot_count"),
                                    DB::raw("GROUP_CONCAT(binary_points_id) as all_binary_points_id")
                                )
                                ->paginate(10);
          
            $response['max_points_per_level'] = $slot->max_points_per_level;
            $response['max_earnings_per_level'] = $slot->max_earnings_per_level;
            $response['total_earnings'] = Tbl_binary_points::where("binary_points_slot_id",$slot_id)->sum("binary_points_income");
        } else if($history_type == "per_cycle") {
            if ($binary_settings->cycle_per_day == 1) {
                if ($binary_settings->binary_limit_type == 1) {
                    $earningsExpression = DB::raw("COUNT(earning_log_amount) as earnings");
                } else if ($binary_settings->binary_limit_type == 2) {
                    $earningsExpression = DB::raw("SUM(earning_log_amount) as earnings");
                }
                
                $response['data'] = Tbl_earning_log::where('earning_log_slot_id', $slot_id)
                    ->where("earning_log_plan_type", "BINARY")
                    ->select(
                        DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%M %d, %Y') as earning_log_date_created"),
                        $earningsExpression
                    )
                    ->groupBy(DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%M %d, %Y')"))
                    ->orderBy('earning_log_slot_id', 'desc')
                    ->paginate(10);
                    
            } else if ($binary_settings->cycle_per_day == 2) {
                if ($binary_settings->binary_limit_type == 1) {
                    $morningEarnings = DB::raw("COALESCE(COUNT(CASE WHEN TIME(tbl_earning_log.earning_log_date_created) < '12:00:00' THEN tbl_earning_log.earning_log_amount END), 0) as morning_earnings");
                    $afternoonEarnings = DB::raw("COALESCE(COUNT(CASE WHEN TIME(tbl_earning_log.earning_log_date_created) >= '12:00:00' THEN tbl_earning_log.earning_log_amount END), 0) as afternoon_earnings");
                } else if ($binary_settings->binary_limit_type == 2) {
                    $morningEarnings = DB::raw("COALESCE(SUM(CASE WHEN TIME(tbl_earning_log.earning_log_date_created) < '12:00:00' THEN tbl_earning_log.earning_log_amount END), 0) as morning_earnings");
                    $afternoonEarnings = DB::raw("COALESCE(SUM(CASE WHEN TIME(tbl_earning_log.earning_log_date_created) >= '12:00:00' THEN tbl_earning_log.earning_log_amount END), 0) as afternoon_earnings");
                }
                
                $response['data'] = Tbl_earning_log::where('earning_log_slot_id', $slot_id)
                    ->where("earning_log_plan_type", "BINARY")
                    ->select(
                        DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%M %d, %Y') as earning_log_date_created"),
                        $morningEarnings,
                        $afternoonEarnings
                    )
                    ->groupBy(DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%M %d, %Y')"))
                    ->orderBy(DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%M %d, %Y')"), 'desc')
                    ->paginate(10);
            } else if ($binary_settings->cycle_per_day == 3) {
                $response['data'] = Tbl_earning_log::where('earning_log_slot_id', $slot_id)
                    ->where("earning_log_plan_type", "BINARY")
                    ->select(
                        DB::raw("YEARWEEK(earning_log_date_created, 1) as year_week"), // Group by week
                        DB::raw("MIN(DATE_SUB(earning_log_date_created, INTERVAL WEEKDAY(earning_log_date_created) DAY)) as start_of_week"), // Start of the week (Monday)
                        DB::raw("MAX(DATE_ADD(DATE_SUB(earning_log_date_created, INTERVAL WEEKDAY(earning_log_date_created) DAY), INTERVAL 6 DAY)) as end_of_week"), // End of the week (Sunday)
                        DB::raw("SUM(tbl_earning_log.earning_log_amount) as total_earnings"), // Total earnings for the week
                        DB::raw("COUNT(tbl_earning_log.earning_log_amount) as total_pairs")   // Total pairs for the week
                    )
                    ->groupBy(DB::raw("YEARWEEK(earning_log_date_created, 1)")) // Group by week number
                    ->orderBy(DB::raw("YEARWEEK(earning_log_date_created, 1)"), 'desc') // Sort weeks in descending order
                    ->paginate(10);

            } else if ($binary_settings->cycle_per_day == 4) {
                if ($binary_settings->binary_limit_type == 1) {
                    $earningsExpression = DB::raw("COUNT(earning_log_amount) as earnings");
                } else if ($binary_settings->binary_limit_type == 2) {
                    $earningsExpression = DB::raw("SUM(earning_log_amount) as earnings");
                }
                $totalStats = Tbl_earning_log::where('earning_log_slot_id', $slot_id)
                    ->where("earning_log_plan_type", "BINARY")
                    ->select(
                        DB::raw("SUM(tbl_earning_log.earning_log_amount) as total_earnings"),
                        DB::raw("COUNT(tbl_earning_log.earning_log_amount) as total_pairs")
                    )
                    ->first();

                $earningLogs = Tbl_earning_log::where('earning_log_slot_id', $slot_id)
                    ->where("earning_log_plan_type", "BINARY")
                    ->select(
                        DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%M %d, %Y') as earning_log_date_created"),
                        DB::raw("COUNT(earning_log_amount) as total_pairs"),
                        DB::raw("SUM(earning_log_amount) as total_earnings")
                    )
                    ->groupBy(DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%M %d, %Y')"))
                    ->orderBy('earning_log_slot_id', 'desc')
                    ->paginate(10);

                $response = [
                    'total_earnings' => $totalStats->total_earnings ?? 0,
                    'total_pairs' => $totalStats->total_pairs ?? 0,
                    'data' => $earningLogs
                ];
            }
        }
        
        return $response;
    }

    public function binary_slot_limit() {
        $slot_id = Request::input('current_slot_id');
        $slot = Tbl_slot::where('slot_id', $slot_id)->joinMembership()->first();
        $response['data'] = Tbl_binary_points::where('binary_points_slot_id', $slot_id)
            ->groupBy('binary_cause_level')
            ->select(
                'binary_cause_level as placement_level',
                DB::raw("COUNT(binary_points_id) as total_slot_count"),
                DB::raw("GROUP_CONCAT(binary_points_id) as all_tree_id")
            )
            ->paginate(10);
        $membership_list = Tbl_membership::where('archive', 0)->orderBy('hierarchy', 'asc')->get();
        $slot_per_package = [];

        foreach ($response['data'] as $index => $log) {
            $tree_ids = explode(',', $log->all_tree_id);
            $slot_per_package[$log->placement_level] = [];
            foreach ($membership_list as $membership) {
                $slot_per_package[$log->placement_level][$membership->membership_id] = new stdClass();
                $slot_per_package[$log->placement_level][$membership->membership_id]->left = 0;
                $slot_per_package[$log->placement_level][$membership->membership_id]->right = 0;
            }

            foreach ($tree_ids as $index2 => $log_id) {
                $test[$index][$index2] = new stdClass();

                $tree_log = Tbl_binary_points::where('binary_points_id', $log_id)->first();
                $log_details = Tbl_slot::where('slot_id', $tree_log->binary_cause_slot_id)
                ->leftJoin('tbl_tree_placement', 'tbl_slot.slot_id', '=', 'tbl_tree_placement.placement_child_id')
                ->where('tbl_tree_placement.placement_parent_id', $slot_id)
                ->first();
                $test[$index][$index2]->all_slot_no = $log_details->slot_no;
                foreach ($membership_list as $membership) {
                    if ($tree_log->binary_cause_membership_id == $membership->membership_id) {
                        if($log_details->placement_position == 'LEFT') {
                            $slot_per_package[$log->placement_level][$membership->membership_id]->left++;
                        } else if($log_details->placement_position == 'RIGHT') {
                            $slot_per_package[$log->placement_level][$membership->membership_id]->right++;
                        }
                    }
                    $maxed_slot = Tbl_binary_points_settings::where("membership_id", $slot->slot_membership)->where("membership_entry_id", $membership->membership_id)->first();
                    if($maxed_slot) {
                        $slot_per_package[$log->placement_level][$membership->membership_id]->left_maxed = ($slot_per_package[$log->placement_level][$membership->membership_id]->left >= $maxed_slot->max_slot_per_level);
                        $slot_per_package[$log->placement_level][$membership->membership_id]->right_maxed = ($slot_per_package[$log->placement_level][$membership->membership_id]->right >= $maxed_slot->max_slot_per_level);
                    }
                }
            }
        }
        $max_slot_per_package = [];
        $max_slot_membership = [];
        foreach($membership_list as $membership) {
            $max_slot = Tbl_binary_points_settings::where("membership_id",$slot->slot_membership)->where("membership_entry_id",$membership->membership_id)->where('max_slot_per_level', '!=', 0)->first();
            if($max_slot) {
                $max_slot_per_package[$membership->membership_id] = $max_slot->max_slot_per_level;
                $max_slot_membership[] = $membership;
            }
        }
        $response['membership'] = $max_slot_membership;
        $response['max_slot_per_level'] = $max_slot_per_package;
        $response['slot_per_level'] = $slot_per_package;
        return $response;
    }

    public function mentors_bonus_earning()
    {
        $slot                    = Tbl_slot::where("slot_owner",Request::user()->id)->where("slot_id",Request::input("current_slot_id"))->first();
        $data                    = null;
        $running_balance         = 0;

        if($slot)
        {
            $log = Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)
                                    ->leftJoin("tbl_slot","tbl_slot.slot_id","=","tbl_earning_log.earning_log_cause_id")
                                    ->leftJoin("users","users.id","=","tbl_slot.slot_owner")
                                    ->leftJoin("tbl_membership","tbl_membership.membership_id","=","tbl_earning_log.earning_log_cause_membership_id")
                                    ->where("earning_log_plan_type","MENTORS BONUS")
                                    ->leftJoin("tbl_label","tbl_label.plan_code","=","tbl_earning_log.earning_log_plan_type")
                                    ->select("*",DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%m/%d/%Y') as earning_log_date_created"),
                                                 DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%h:%i %p') as earning_log_time_created"))
                                    ->paginate(10);

            $data["log"] = $log;
            $running_balance = Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)->where("earning_log_plan_type","MENTORS BONUS")->sum("earning_log_amount");
            
        }
        $data['mentor_status'] = Tbl_membership::where('mentors_level','>',0)->count();
        $data["total"]  = number_format($running_balance,2);

        return json_encode($data);

        // $slot   = Tbl_slot::where("slot_owner",Request::user()->id)->where("slot_id",Request::input("current_slot_id"))->leftjoin('users','users.id','tbl_slot.slot_owner')->first();
        
        // $data['log']    = Tbl_earning_log::where('earning_log_slot_id',$slot->slot_id)->where('earning_log_plan_type','MENTORS BONUS')
        //                 ->leftjoin('tbl_slot','tbl_slot.slot_id','tbl_earning_log.earning_log_cause_id')
        //                 ->leftjoin('users','users.id','tbl_slot.slot_owner')
        //                 ->select("*",DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%m/%d/%Y') as earning_log_date_created"),
        //                     DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%h:%i %p') as earning_log_time_created"))
        //                 ->paginate(10);
        // $data['total']   =  Tbl_earning_log::where('earning_log_slot_id',$slot->slot_id)->where('earning_log_plan_type','MENTORS BONUS')
        //                 ->leftjoin('tbl_slot','tbl_slot.slot_id','tbl_earning_log.earning_log_cause_id')
        //                 ->leftjoin('users','users.id','tbl_slot.slot_owner')->sum('earning_log_amount');
        // $data['mentor_status'] = Tbl_membership::where('mentors_level','>',0)->count();
        // return response()->json($data);
    }

    public function unilevel()
    {
        $slot                    = Tbl_slot::where("slot_owner",Request::user()->id)->where("slot_id",Request::input("current_slot_id"))->first();
        $data                    = null;
        $total_ppv               = 0;
        $total_gpv               = 0;
        $required_ppv            = 0;
        $log                     = null;
        $log_personal = null;
        $ctr                     = 0;
        $start_date              = Request::input("start_date");
        $end_date                = Request::input("end_date");
        if($slot)
        {
            $membership                            = Tbl_membership::where("membership_id",$slot->slot_membership)->first();
            if($membership)
            {
                $membership->membership_unilevel_level = $membership->membership_unilevel_level;
                $level = 1;


                $required_ppv                    = $membership->membership_required_pv;
                $first_date                      = $start_date == null ? Carbon::now()->startOfMonth() : $start_date;
                $end_date                        = $end_date == null ? Carbon::now()->endOfMonth() : $end_date;

                $log_personal["level_name"]         = "Personal Purchase";
                $log_personal["number_of_slots"]    = Tbl_unilevel_points::where("unilevel_points_slot_id",$slot->slot_id)->where("unilevel_points_date_created",">=",$first_date)->where("unilevel_points_date_created","<=",$end_date)->where("unilevel_points_type","UNILEVEL_PPV")->where('unilevel_points_distribute',0)->count() ? Tbl_unilevel_points::where("unilevel_points_slot_id",$slot->slot_id)->where("unilevel_points_date_created",">=",$first_date)->where("unilevel_points_date_created","<=",$end_date)->where("unilevel_points_type","UNILEVEL_PPV")->where('unilevel_points_distribute',0)->count()." Purchase(s)" : "No Purchase";
                $log_personal["last_slot_creation"] = Tbl_unilevel_points::where("unilevel_points_slot_id",$slot->slot_id)->where("unilevel_points_type","UNILEVEL_PPV")->first() ? Carbon::parse(Tbl_unilevel_points::where("unilevel_points_slot_id",$slot->slot_id)->where("unilevel_points_type","UNILEVEL_PPV")->orderBy("unilevel_points_date_created","DESC")->first()->unilevel_points_date_created)->format("m/d/Y") : "---";
                $log_personal["earnings"]           = Tbl_unilevel_points::where("unilevel_points_slot_id",$slot->slot_id)->where("unilevel_points_type","UNILEVEL_PPV")->where("unilevel_points_date_created",">=",$first_date)->where("unilevel_points_date_created","<=",$end_date)->where('unilevel_points_distribute',0)->sum("unilevel_points_amount");

                $total_ppv = $total_ppv + $log_personal["earnings"];
                $log_personal["earnings"] = number_format($log_personal["earnings"],2);

                while($membership->membership_unilevel_level >= $level)
                {
                    $log[$ctr]["level_name"]         = $this->ordinal($level);
                    $log[$ctr]["number_of_slots"]    = Tbl_unilevel_points::where("unilevel_points_slot_id",$slot->slot_id)->where("unilevel_points_date_created",">=",$first_date)->where("unilevel_points_date_created","<=",$end_date)->where("unilevel_points_cause_level",$level)->where("unilevel_points_type","UNILEVEL_GPV")->where('unilevel_points_distribute',0)->count() ? Tbl_unilevel_points::where("unilevel_points_slot_id",$slot->slot_id)->where("unilevel_points_cause_level",$level)->where("unilevel_points_date_created",">=",$first_date)->where("unilevel_points_date_created","<=",$end_date)->where("unilevel_points_type","UNILEVEL_GPV")->where('unilevel_points_distribute',0)->count()." Purchase(s)" : "No Purchase";
                    $log[$ctr]["last_slot_creation"] = Tbl_unilevel_points::where("unilevel_points_slot_id",$slot->slot_id)->where("unilevel_points_cause_level",$level)->where("unilevel_points_type","UNILEVEL_GPV")->first() ? Carbon::parse(Tbl_unilevel_points::where("unilevel_points_slot_id",$slot->slot_id)->where("unilevel_points_cause_level",$level)->where("unilevel_points_type","UNILEVEL_GPV")->orderBy("unilevel_points_date_created","DESC")->first()->unilevel_points_date_created)->format("m/d/Y") : "---";
                    $log[$ctr]["earnings"]           = Tbl_unilevel_points::where("unilevel_points_slot_id",$slot->slot_id)->where("unilevel_points_cause_level",$level)->where("unilevel_points_date_created",">=",$first_date)->where("unilevel_points_date_created","<=",$end_date)->where("unilevel_points_type","UNILEVEL_GPV")->where('unilevel_points_distribute',0)->sum("unilevel_points_amount");

                    $total_gpv = $total_gpv + $log[$ctr]["earnings"];

                    $log[$ctr]["earnings"] = number_format($log[$ctr]["earnings"],2);

                    $ctr++;
                    $level++;
                }
            }
            $history = Tbl_unilevel_distribute::where("slot_id",$slot->slot_id)->get();
            // foreach ($history as $key => $value)
            // {
            //     $history[$key]->sum = Tbl_wallet_log::whereDate("wallet_log_date_created",">=",$value->unilevel_distribute_date_start)->whereDate("wallet_log_date_created","<=",$value->unilevel_distribute_end_start)->where("wallet_log_details","=","UNILEVEL")->where("wallet_log_slot_id",$slot->slot_id)->sum("wallet_log_amount");

            //     if($history[$key]->sum == 0)
            //     {
            //         $history[$key]->is_qualified = 0;
            //     }
            //     else
            //     {
            //         $history[$key]->is_qualified = 1;
            //     }
            // }
            $total_unilevel_sum = Tbl_wallet_log::where("wallet_log_details","UNILEVEL")->where("wallet_log_slot_id",$slot->slot_id)->sum("wallet_log_amount");
        }

        $data["log"]           = $log;
        $data["log_personal"] = $log_personal;
        $data["history"]       = $history;
        $data["total_history"] = number_format($total_unilevel_sum,2);
        $data["total_ppv"]     = number_format($total_ppv,2);
        $data["total_gpv"]     = number_format($total_gpv,2);
        $data["required_ppv"]  = number_format($required_ppv,2);
        $data["passed"]        = $total_ppv >= $required_ppv ? 1 : 0;

        return json_encode($data);
    }
    public function unilevel_dynamic()
    {
        $slot                    = Tbl_slot::where("slot_owner",Request::user()->id)->where("slot_id",Request::input("current_slot_id"))->first();
        $data                    = null;
        $total_ppv               = 0;
        $total_gpv               = 0;
        $required_ppv            = 0;
        $log                     = null;
        $ctr                     = 0;
        $start_date              = Request::input("start_date");
        $end_date                = Request::input("end_date");
        if($slot)
        {
            $membership                            = Tbl_membership::where("membership_id",$slot->slot_membership)->first();
            if($membership)
            {
                $membership->membership_unilevel_level = $membership->membership_unilevel_level;
                $level                                 = 1;


                $required_ppv                    = $membership->membership_required_pv;
                $first_date                      = $start_date == null ? Carbon::now()->startOfMonth()->format("Y-m-d") : $start_date;
                $end_date                        = $end_date == null ? Carbon::now()->endOfMonth()->format("Y-m-d") : $end_date;

                $log[$ctr]["level_name"]         = "Personal Purchase";
                $log[$ctr]["number_of_slots"]    = Tbl_unilevel_points::where("unilevel_points_slot_id",$slot->slot_id)->where("unilevel_points_date_created",">=",$first_date)->where("unilevel_points_date_created","<=",$end_date)->where("unilevel_points_type","UNILEVEL_PPV")->count() ? Tbl_unilevel_points::where("unilevel_points_slot_id",$slot->slot_id)->where("unilevel_points_date_created",">=",$first_date)->where("unilevel_points_date_created","<=",$end_date)->where("unilevel_points_type","UNILEVEL_PPV")->count()." Purchase(s)" : "No Purchase";
                $log[$ctr]["last_slot_creation"] = Tbl_unilevel_points::where("unilevel_points_slot_id",$slot->slot_id)->where("unilevel_points_type","UNILEVEL_PPV")->first() ? Carbon::parse(Tbl_unilevel_points::where("unilevel_points_slot_id",$slot->slot_id)->where("unilevel_points_type","UNILEVEL_PPV")->orderBy("unilevel_points_date_created","DESC")->first()->unilevel_points_date_created)->format("m/d/Y") : "---";
                $log[$ctr]["earnings"]           = Tbl_unilevel_points::where("unilevel_points_slot_id",$slot->slot_id)->where("unilevel_points_type","UNILEVEL_PPV")->whereDate("unilevel_points_date_created",">=",$first_date)->whereDate("unilevel_points_date_created","<=",$end_date)->where("unilevel_points_distribute",0)->sum("unilevel_points_amount");
                // $log[$ctr]["number_of_slots"]    = Tbl_dynamic_compression_record::where("slot_id",$slot->slot_id)->whereDate("start_date","=",$first_date)->where("end_date","=",$end_date)->where("dynamic_level",$level)->count() ?
                //                                    Tbl_dynamic_compression_record::where("slot_id",$slot->slot_id)->where("dynamic_level",$level)->whereDate("start_date","=",$first_date)->whereDate("end_date","=",$end_date)->count()." Purchase(s)" : "No Purchase";
                // $log[$ctr]["earnings"]           = Tbl_dynamic_compression_record::where("slot_id",$slot->slot_id)->where("dynamic_level",$level)->where("start_date","=",$first_date)->sum("earned_points");
                // dd($log[$ctr]["earnings"],$slot->slot_id,$level,$first_date,$end_date);
                $total_ppv = $total_ppv + $log[$ctr]["earnings"];

                $log[$ctr]["earnings"] = number_format($log[$ctr]["earnings"],2);

                $ctr++;

                while($membership->membership_unilevel_level >= $level)
                {
                    $log[$ctr]["level_name"]         = $this->ordinal($level);
                    $log[$ctr]["number_of_slots"]    = Tbl_dynamic_compression_record::where("slot_id",$slot->slot_id)->whereDate("start_date",">=",$first_date)->where("end_date","<=",$end_date)->where("dynamic_level",$level)->get() ? Tbl_dynamic_compression_record::where("slot_id",$slot->slot_id)->where("dynamic_level",$level)->whereDate("start_date",">=",$first_date)->whereDate("end_date","<=",$end_date)->count()." Purchase(s)" : "No Purchase";
                    $log[$ctr]["earnings"]           = Tbl_dynamic_compression_record::where("slot_id",$slot->slot_id)->where("dynamic_level",$level)->where("start_date","=",$first_date)->where("end_date","=",$end_date)->sum("earned_points");

                    $total_gpv = $total_gpv + $log[$ctr]["earnings"];

                    $log[$ctr]["earnings"] = number_format($log[$ctr]["earnings"],2);

                    $ctr++;
                    $level++;
                }
            }
            $history = Tbl_unilevel_distribute::where("slot_id",$slot->slot_id)->get();
            // foreach ($history as $key => $value)
            // {
            //     $history[$key]->sum = Tbl_wallet_log::whereDate("wallet_log_date_created",">=",$value->unilevel_distribute_date_start)->whereDate("wallet_log_date_created","<=",$value->unilevel_distribute_end_start)->where("wallet_log_details","=","UNILEVEL COMMISSION")->where("wallet_log_slot_id",$slot->slot_id)->sum("wallet_log_amount");

            //     if($history[$key]->sum == 0)
            //     {
            //         $history[$key]->is_qualified = 0;
            //     }
            //     else
            //     {
            //         $history[$key]->is_qualified = 1;
            //     }
            // }
            $total_unilevel_sum = Tbl_wallet_log::where("wallet_log_details","UNILEVEL COMMISSION")->where("wallet_log_slot_id",$slot->slot_id)->sum("wallet_log_amount");
        }

        $data["log"]           = $log;
        $data["history"]       = $history;
        $data["total_history"] = number_format($total_unilevel_sum,2);
        $data["total_ppv"]     = number_format($total_ppv,2);
        $data["total_gpv"]     = number_format($total_gpv,2);
        $data["required_ppv"]  = number_format($required_ppv,2);
        $data["passed"]        = $total_ppv >= $required_ppv ? 1 : 0;
        $data["first_date"]    = $first_date;
        $data["end_date"]      = $end_date;

        return json_encode($data);
    }

    public function get_dynamic_breakdown()
    {
      $slot_id        = Request::input("current_slot_id");
      $level          = Request::input("level");
      $end            = Request::input("end");
      $start          = Request::input("start");
    //   dd(Request::input());
      // if($level == 0)
      // {
      //   $slot_breakdown["level"] = $level;
      //   $query                          = Tbl_dynamic_compression_record::where("cause_slot_id",$slot_id)->leftJoin("tbl_slot","tbl_slot.slot_id","=","tbl_dynamic_compression_record.cause_slot_id")
      //                                                                     ->where("dynamic_level",$level+1)
      //                                                                     ->select("dynamic_level","earned_points","slot_no");
      //   $slot_breakdown["total_points"] = $query->sum("earned_points");
      //   $slot_breakdown["slots"]        = $query->get();
      // }
      // else
      // {
        $slot_breakdown["level"] = $level;
        $query                          = Tbl_dynamic_compression_record::where("tbl_dynamic_compression_record.slot_id",$slot_id)->leftJoin("tbl_slot","tbl_slot.slot_id","=","tbl_dynamic_compression_record.cause_slot_id")
                                                                          ->where("dynamic_level",$level)
                                                                          ->whereDate("start_date",">=",$start)
                                                                          ->whereDate("end_date","<=",$end)
                                                                          ->select("dynamic_level","earned_points","slot_no");
        $slot_breakdown["total_points"] = $query->sum("earned_points");
        $slot_breakdown["slots"]        = $query->get();
      // }


      return $slot_breakdown;
    }

    public function get_check_match_earning()
    {
        $slot                    = Tbl_slot::where("slot_owner",Request::user()->id)->where("slot_id",Request::input("current_slot_id"))->first();
        $data                    = null;
        $running_balance         = 0;

        if($slot)
        {

            $log = Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)
                                    ->leftJoin("tbl_slot","tbl_slot.slot_id","=","tbl_earning_log.earning_log_cause_id")
                                    ->leftJoin("users","users.id","=","tbl_slot.slot_owner")
                                    ->leftJoin("tbl_membership","tbl_membership.membership_id","=","tbl_earning_log.earning_log_cause_membership_id")
                                    ->where("earning_log_plan_type","CHECK MATCH INCOME")
                                    ->leftJoin("tbl_label","tbl_label.plan_code","=","tbl_earning_log.earning_log_plan_type")
                                    ->select("*",DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%m/%d/%Y') as earning_log_date_created"),
                                                DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%h:%i %p') as earning_log_time_created"))
                                    ->paginate(10);

            $data["log"] = $log;
            $running_balance = Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)->where("earning_log_plan_type","CHECK MATCH INCOME")->sum("earning_log_amount");
        }

        $data["total"]  = number_format($running_balance,2);

        return json_encode($data);
    }

    public function leadership_bonus_earning()
    {
        $slot                    = Tbl_slot::where("slot_owner",Request::user()->id)->where("slot_id",Request::input("current_slot_id"))->first();
        $data                    = null;
        $running_balance         = 0;

        if($slot)
        {

            $log = Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)
                                    ->leftJoin("tbl_slot","tbl_slot.slot_id","=","tbl_earning_log.earning_log_cause_id")
                                    ->leftJoin("users","users.id","=","tbl_slot.slot_owner")
                                    ->leftJoin("tbl_membership","tbl_membership.membership_id","=","tbl_earning_log.earning_log_cause_membership_id")
                                    ->where("earning_log_plan_type","OVERRIDE COMMISSION")
                                    ->leftJoin("tbl_label","tbl_label.plan_code","=","tbl_earning_log.earning_log_plan_type")
                                    ->select("*",DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%m/%d/%Y') as earning_log_date_created"),
                                                DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%h:%i %p') as earning_log_time_created"))
                                    ->paginate(10);

            $data["log"] = $log;
            $running_balance = Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)->where("earning_log_plan_type","OVERRIDE COMMISSION")->sum("earning_log_amount");
        }

        $data["total"]  = number_format($running_balance,2);

        return json_encode($data);
    }


    function ordinal($number)
    {
        $ends = array('th','st','nd','rd','th','th','th','th','th','th');
        if ((($number % 100) >= 11) && (($number%100) <= 13))
            return $number. 'th';
        else
            return $number. $ends[$number % 10];
    }
    public function get_earning_label(){
        $response = Tbl_label::get();
        return response()->json($response, 200);
    }

    public function dropshipping_bonus()
    {
        $slot_id = Request::input('current_slot_id');
        $label = Tbl_label::where('plan_code','DROPSHIPPING_BONUS')->first()->plan_name;

        $response = Tbl_dropshipping_bonus_logs::where('tbl_dropshipping_bonus_logs.slot_id',$slot_id)
                        ->leftjoin('tbl_slot','tbl_slot.slot_id','=','tbl_dropshipping_bonus_logs.slot_id')
                        ->leftjoin('users','users.id','=','tbl_slot.slot_owner')
                        ->leftjoin('tbl_item','tbl_item.item_id','=','tbl_dropshipping_bonus_logs.item_id')
                        ->orderBy('tbl_dropshipping_bonus_logs.date','DESC')->paginate(10);

        foreach($response as $key => $data) {
            $order = Tbl_orders::where('order_id', $data->order_id)->first();
            $response[$key]->buyer_name = $order ? $order->buyer_name : 'N/A';
            $response[$key]->buyer_contact_number = $order ? $order->buyer_contact_number : 'N/A';
        }

        return $response;
    }

    public function welcome_bonus_earning()
    {
        $slot                    = Tbl_slot::where("slot_owner",Request::user()->id)->where("slot_id",Request::input("current_slot_id"))->first();
        $data                    = null;
        $running_balance         = 0;
        
        if($slot)
        {

            $log = Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)
                                    ->leftJoin("tbl_slot","tbl_slot.slot_id","=","tbl_earning_log.earning_log_cause_id")
                                    ->leftJoin("users","users.id","=","tbl_slot.slot_owner")
                                    ->leftJoin("tbl_membership","tbl_membership.membership_id","=","tbl_earning_log.earning_log_cause_membership_id")
                                    ->where("earning_log_plan_type","WELCOME BONUS")
                                    ->leftJoin("tbl_label","tbl_label.plan_code","=","tbl_earning_log.earning_log_plan_type")
                                    ->select("*",DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%m/%d/%Y') as earning_log_date_created"),
                                                 DB::raw("DATE_FORMAT(tbl_earning_log.earning_log_date_created, '%h:%i %p') as earning_log_time_created"))
                                    ->paginate(10);

            $data["log"] = $log;
            $running_balance = Tbl_earning_log::where("earning_log_slot_id",$slot->slot_id)->where("earning_log_plan_type","WELCOME BONUS")->sum("earning_log_amount");
        }

        $data["total"]  = number_format($running_balance,2);

        return json_encode($data);
    }
}
