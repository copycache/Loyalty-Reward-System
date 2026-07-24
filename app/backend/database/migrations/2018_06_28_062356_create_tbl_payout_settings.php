<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblPayoutSettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_payout_settings', function (Blueprint $table) 
        {
            $table->increments('payout_settings_id');
            $table->tinyInteger('encash_all_wallet_cutoff')->default(0);
            $table->double('minimum_encashment')->default(0);
            $table->tinyInteger('bank_enable_payout')->default(0);
            $table->double('bank_additional_charge')->default(0);
            $table->tinyInteger('remittance_enable_payout')->default(0);
            $table->double('remittance_additional_charge')->default(0);
            $table->tinyInteger('cheque_enable_payout')->default(0);
            $table->double('cheque_additional_charge')->default(0);
            $table->tinyInteger('cheque_allow_choose_name')->default(0);
            $table->tinyInteger('coinsph_enable_payout')->default(0);
            $table->double('coinsph_additional_charge')->default(0);
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
