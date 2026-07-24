<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblSlotAddSlotBinaryWalletPoints extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_slot', function (Blueprint $table) 
        {
            $table->double('slot_binary_wallet_points')->default(0)->after("slot_wallet");
        });
        Schema::table('tbl_binary_settings', function (Blueprint $table) 
        {
            $table->smallInteger('binary_points_enable')->default(0);
            $table->double('binary_points_minimum_conversion')->default(0);
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
