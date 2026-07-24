<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblItem extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_item', function (Blueprint $table) 
        {
            $table->increments('item_id');
            $table->string('item_sku');
            $table->text('item_description');
            $table->string('item_barcode');
            $table->double('item_price')->default(0);
            $table->double('item_gc_price')->default(0);
            $table->string('item_type')->default('product');
            $table->integer('membership_id');
            $table->integer('slot_qty')->default(1);
            $table->double('inclusive_gc')->default(0);
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
