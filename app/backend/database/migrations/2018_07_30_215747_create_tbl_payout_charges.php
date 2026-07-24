<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblPayoutCharges extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_payout_charges', function (Blueprint $table) 
        {
            $table->increments('payout_charges_id');
            $table->double('payout_charges_charge')->default(0);
            $table->double('payout_charges_tax')->default(0);
            $table->double('payout_charges_giftcard')->default(0);
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
