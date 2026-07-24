<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblPayoutCharge extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_payout_charge', function (Blueprint $table) 
        {
            $table->increments('payout_charge_id');
            $table->string('payout_charge_name');
            $table->string('payout_charge_status');
            $table->string('payout_charge_type');
            $table->double('payout_charge_value');
            $table->tinyInteger('archive')->default(0);

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
