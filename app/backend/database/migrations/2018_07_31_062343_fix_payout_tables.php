<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class FixPayoutTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists('tbl_payout_method');
        Schema::dropIfExists('tbl_payout_type');

        Schema::create('tbl_payout_type', function (Blueprint $table) 
        {
            $table->increments('payout_type_id');
            $table->string('payout_type_name');
            $table->string('payout_type_code');
            $table->tinyInteger('archived')->default(0);
        });  

        Schema::create('tbl_payout_method', function (Blueprint $table) 
        {
            $table->increments('payout_method_id');
            $table->string('payout_method_name');
            $table->string('payout_method_type');
            $table->double('payout_method_fee')->default(0);
            $table->string('payout_method_fee_type')->nullable();
            $table->text('payout_method_image')->nullable();
            $table->tinyInteger('archived')->default(0);
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
