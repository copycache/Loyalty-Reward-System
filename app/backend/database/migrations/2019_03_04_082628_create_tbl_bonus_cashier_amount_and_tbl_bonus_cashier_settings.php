<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblBonusCashierAmountAndTblBonusCashierSettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("tbl_cashier_bonus",function ( Blueprint $table )
        {
            $table->increments('cashier_bonus_id');
            $table->integer('cashier_bonus_buy_amount');
            $table->integer('cashier_bonus_given_amount');
            $table->smallinteger('archive')->default(0);
        });
        Schema::create("tbl_cashier_bonus_settings",function ( Blueprint $table )
        {
            $table->increments('cashier_bonus_settings_id');
            $table->smallinteger('cashier_bonus_enable')->default(0);
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
