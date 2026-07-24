<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class FixMigrationOfTblItemToTblCode extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("tbl_codes",function ( Blueprint $table )
        {
            $table->integer('kit_requirement')->unsigned()->nullable();
            $table->foreign('kit_requirement')->references('item_id')->on('tbl_item')->onDelete('cascade');
            $table->dateTime('date_packed')->nullable();
        });

        Schema::table("tbl_item",function ( Blueprint $table )
        {
            $table->dropColumn('kit_requirement');
            $table->dropColumn('date_packed');
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
