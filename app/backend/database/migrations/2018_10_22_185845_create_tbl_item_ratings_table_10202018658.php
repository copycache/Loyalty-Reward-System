<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblItemRatingsTable10202018658 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_item_rating', function (Blueprint $table) 
        {
            $table->increments('item_rate_id');
            $table->double('item_rate')->default(0);
            $table->integer('item_id')->default(0);
            $table->integer('user_id')->default(0);
            $table->text('item_review')->nullable();
            $table->integer('item_is_disabled')->default(0);
            $table->string('item_rate_created');
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
