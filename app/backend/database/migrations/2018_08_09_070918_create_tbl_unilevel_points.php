<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblUnilevelPoints extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_unilevel_points', function (Blueprint $table) 
        {
            $table->increments('unilevel_points_id');
            $table->integer('unilevel_points_slot_id')->unsigned();
            $table->double('unilevel_points_amount');
            $table->string('unilevel_points_type');
            $table->integer('unilevel_points_cause_id')->unsigned()->nullable();
            $table->integer('unilevel_points_cause_membership_id')->unsigned()->nullable();
            $table->integer('unilevel_points_cause_level')->default(0);
            $table->string('unilevel_points_date_created');

            $table->foreign('unilevel_points_slot_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
            $table->foreign('unilevel_points_cause_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
            $table->foreign('unilevel_points_cause_membership_id')->references('membership_id')->on('tbl_membership')->onDelete('cascade');
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
