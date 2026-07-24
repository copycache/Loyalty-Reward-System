<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblDeliveryChargeMethodChargeToDouble extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
         Schema::table('tbl_delivery_charge', function (Blueprint $table) 
        {
            $table->dropColumn('method_charge');
        });
         
         Schema::table('tbl_delivery_charge', function (Blueprint $table) 
        {
            $table->double('method_charge');
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
