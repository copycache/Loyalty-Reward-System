<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblUnilevelDistributeRelationships extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_unilevel_distribute', function (Blueprint $table) 
        {
            $table->integer('slot_id')->unsigned()->nullable()->change();
            $table->foreign('slot_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');

            $table->integer('distribute_full_id')->unsigned()->nullable()->change();
            $table->foreign('distribute_full_id')->references('distribute_full_id')->on('tbl_unilevel_distribute_full')->onDelete('cascade');
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
