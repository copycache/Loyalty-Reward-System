<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblCodListTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_cod_list', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('slot_id')->unsigned();
            $table->integer('order_id')->unsigned();
            $table->text('ordered_item')->nullable();
            $table->double('subtotal')->nullable();
            $table->integer('status')->default(0);
            $table->string('date_ordered')->nullable();
            $table->string('date_completed')->nullable();

            $table->foreign('slot_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
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
        Schema::dropIfExists('tbl_cod_list');
    }
}
