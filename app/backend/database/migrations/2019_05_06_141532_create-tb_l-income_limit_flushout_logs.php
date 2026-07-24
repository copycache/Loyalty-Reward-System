<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTbLIncomeLimitFlushoutLogs extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_income_limit_flushout_logs', function (Blueprint $table) 
        {
            $table->increments('income_limit_flushout_logs_id');
            $table->double('flushout_income_amount')->default(0);
            $table->integer('flushout_income_slot_id')->unsigned();
            $table->foreign('flushout_income_slot_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');

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
