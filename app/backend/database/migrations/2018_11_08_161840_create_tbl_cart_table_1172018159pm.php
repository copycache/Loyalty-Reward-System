<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblCartTable1172018159pm extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_cart', function (Blueprint $table) 
        {
            $table->increments('cart_id');
            $table->string('cart_key');
            $table->integer('cart_item_id');
            $table->integer('cart_item_quantity');
            $table->string('cart_created')->nullable();
            $table->string('cart_updated')->nullable();
            $table->tinyInteger('cart_status')->default(0);
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
