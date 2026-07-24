<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblDropshippingList extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_dropshipping_list', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('order_id')->unsigned();
            $table->text('ordered_item')->nullable();
            $table->double('subtotal')->nullable();
            $table->integer('status')->default(0);
            $table->string('date_ordered')->nullable();
            $table->string('date_completed')->nullable();
            $table->foreign('order_id')->references('order_id')->on('tbl_orders')->onDelete('cascade');
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
