<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblItemAddColumnsPointsIncentivesAndCurrency extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_item', function (Blueprint $table) 
        {
            $table->double('item_points_incetives')->default(0)->after('item_category');
        });
        Schema::table('tbl_item', function (Blueprint $table) 
        {
            $table->double('item_points_currency')->after('item_points_incetives');
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
