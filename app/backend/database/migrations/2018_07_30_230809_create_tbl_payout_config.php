<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblPayoutConfig extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_payout_config', function (Blueprint $table) 
        {
            $table->increments('payout_config_id');
            $table->string('payout_config_type');
            $table->string('payout_config_name');
            $table->double('payout_minimum_encashment')->default(0);
            $table->tinyInteger('payout_config_enabled')->default(0);
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
