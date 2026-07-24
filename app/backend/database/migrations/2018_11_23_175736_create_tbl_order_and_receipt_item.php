<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblOrderAndReceiptItem extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_orders_rel_item', function (Blueprint $table) 
        {   
            $table->increments('orders_rel_item_id');
            $table->integer('rel_order_id')->unsigned();
            $table->foreign('rel_order_id')->references('order_id')->on('tbl_orders')->onDelete('cascade');
            $table->integer('item_id')->unsigned();
            $table->foreign('item_id')->references('item_id')->on('tbl_item')->onDelete('cascade');
            $table->integer('quantity');

        });

        Schema::create('tbl_receipt_rel_item', function (Blueprint $table) 
        {   
            $table->increments('receipt_rel_item_id');
            $table->integer('rel_receipt_id')->unsigned();
            $table->foreign('rel_receipt_id')->references('receipt_id')->on('tbl_receipt')->onDelete('cascade');
            $table->integer('item_id')->unsigned();
            $table->foreign('item_id')->references('item_id')->on('tbl_item')->onDelete('cascade');
            $table->integer('quantity');
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
