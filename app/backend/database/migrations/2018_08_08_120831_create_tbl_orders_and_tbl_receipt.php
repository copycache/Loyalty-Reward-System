<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblOrdersAndTblReceipt extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_orders', function (Blueprint $table) 
        {
            $table->increments('order_id');
            $table->text('items');
            $table->integer('quantity');
            $table->string('delivery_method');
            $table->integer('delivery_charge')->default(0);
            $table->string('order_status');
            $table->double('subtotal');
            $table->text('buyer_name');
            $table->text('buyer_slot_code');
            $table->integer('buyer_slot_id')->unsigned()->nullable();
            $table->foreign('buyer_slot_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
            $table->dateTime('order_date_created');
            $table->string('discount_type');
            $table->double('discount')->default(0);
            $table->double('grand_total');
        });

        Schema::create('tbl_receipt', function (Blueprint $table) 
        {
            $table->increments('receipt_id');
            $table->text('items');
            $table->integer('quantity');
            $table->string('delivery_method');
            $table->integer('delivery_charge')->default(0);
            $table->double('subtotal');
            $table->text('buyer_name');
            $table->text('buyer_slot_code');
            $table->integer('buyer_slot_id')->unsigned()->nullable();
            $table->foreign('buyer_slot_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
            $table->dateTime('receipt_date_created');
            $table->string('discount_type');
            $table->double('discount')->default(0);
            $table->double('grand_total');
            $table->string('claim_code');
            $table->tinyInteger('claimed')->default(0);
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
