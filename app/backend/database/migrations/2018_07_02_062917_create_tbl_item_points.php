<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblItemPoints extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_item_points', function (Blueprint $table) 
        {
            $table->increments('item_points_id');
            $table->string('item_points_key');
            $table->double('item_points_personal_pv')->default(0);
            $table->double('item_points_group_pv')->default(0);
            $table->integer('item_id');
            $table->integer('membership_id');
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
