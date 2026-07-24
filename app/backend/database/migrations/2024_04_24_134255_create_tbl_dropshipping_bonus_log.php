<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblDropshippingBonusLog extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_dropshipping_bonus_logs', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('slot_id')->unsigned();
            $table->integer('membership_id')->unsigned();
            $table->integer('item_id')->unsigned();
            $table->double('commission')->nullable();
            $table->string('type')->nullable();
            $table->string('date')->nullable();

            $table->foreign('slot_id')
            ->references('slot_id')->on('tbl_slot')
            ->onDelete('cascade');
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
