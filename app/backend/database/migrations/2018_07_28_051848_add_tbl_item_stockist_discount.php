<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTblItemStockistDiscount extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_item_stockist_discount', function (Blueprint $table) 
        {
            $table->increments('item_stockist_discount_id');
            $table->integer('stockist_level_id')->unsigned()->nullable();
            $table->foreign('stockist_level_id')->references('stockist_level_id')->on('tbl_stockist_level')->onDelete('cascade');
            $table->integer('item_id')->unsigned()->nullable();
            $table->foreign('item_id')->references('item_id')->on('tbl_item')->onDelete('cascade');
            $table->double('discount')->default(0);
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
