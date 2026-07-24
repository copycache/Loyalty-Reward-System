<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblDropshippingBonus extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_dropshipping_bonus', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('membership_id')->unsigned();
            $table->integer('item_id')->unsigned();
            $table->double('commission')->default(0);
            $table->string('type')->nullable();

            $table->foreign('item_id')
            ->references('item_id')->on('tbl_item')
            ->onDelete('cascade');
            $table->foreign('membership_id')
            ->references('membership_id')->on('tbl_membership')
            ->onDelete('cascade');
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
