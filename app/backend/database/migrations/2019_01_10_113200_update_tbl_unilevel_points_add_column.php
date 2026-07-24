<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblUnilevelPointsAddColumn extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_unilevel_points', function (Blueprint $table) 
        {   
            $table->integer('unilevel_item_id')->unsigned()->nullable()->after("unilevel_points_cause_membership_id");
            $table->foreign('unilevel_item_id')->references('item_id')->on('tbl_item')->onDelete('cascade');
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
