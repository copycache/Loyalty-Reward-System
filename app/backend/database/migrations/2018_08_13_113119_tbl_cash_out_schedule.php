<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class TblCashOutSchedule extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_cash_out_schedule', function (Blueprint $table) {
            $table->increments('schedule_id');
            $table->string('schedule_status');
            $table->dateTime('schedule_date_from');
            $table->dateTime('schedule_date_to');
            $table->double('total_payout_amount');
            $table->double('total_payout_charge');
            $table->double('total_payout_required');
            $table->dateTime('date_created');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
