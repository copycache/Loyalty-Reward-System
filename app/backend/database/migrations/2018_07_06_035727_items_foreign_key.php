<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ItemsForeignKey extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('rel_item_kit', function (Blueprint $table) 
        {
            $table->integer('item_inclusive_id')->unsigned()->change();
            $table->integer('item_id')->unsigned()->change();

            $table->foreign('item_inclusive_id')
                  ->references('item_id')->on('tbl_item')
                  ->onDelete('cascade');

            $table->foreign('item_id')
                  ->references('item_id')->on('tbl_item')
                  ->onDelete('cascade');
        });

        Schema::table('tbl_item_points', function (Blueprint $table) 
        {
            $table->integer('item_id')->unsigned()->change();

            $table->foreign('item_id')
                  ->references('item_id')->on('tbl_item')
                  ->onDelete('cascade');
        });

        Schema::table('tbl_item_membership_discount', function (Blueprint $table) 
        {
            $table->integer('item_id')->unsigned()->change();

            $table->foreign('item_id')
                  ->references('item_id')->on('tbl_item')
                  ->onDelete('cascade');

            $table->integer('membership_id')->unsigned()->change();

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
