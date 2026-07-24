<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblWallet extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_wallet', function (Blueprint $table) 
        {
            $table->increments('wallet_id');
            $table->double('wallet_amount');

            $table->integer('slot_id')->unsigned()->nullable();
            $table->foreign('slot_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
            
            $table->integer('currency_id')->unsigned()->nullable();
            $table->foreign('currency_id')->references('currency_id')->on('tbl_currency')->onDelete('cascade');
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
