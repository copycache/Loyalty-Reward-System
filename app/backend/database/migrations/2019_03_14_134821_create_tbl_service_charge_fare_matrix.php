<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblServiceChargeFareMatrix extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("tbl_shipping_fee_matrix",function ( Blueprint $table )
        {
            $table->increments('shipping_fee_matrix_id');
            $table->integer('shipping_fee_increment')->default(1);
            $table->double('shipping_fee_increment_amount')->default(0);
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
