<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblPointsLog extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_points_log', function (Blueprint $table) 
        {
            $table->increments('points_log_id');
            $table->integer('points_log_slot_id')->unsigned();
            $table->double('points_log_amount');
            $table->string('points_log_type');
            $table->integer('points_log_cause_id')->unsigned()->nullable();
            $table->integer('points_log_cause_membership_id')->unsigned()->nullable();
            $table->integer('points_log_cause_level')->default(0);
            $table->string('points_log_date_created');

            $table->foreign('points_log_slot_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
            $table->foreign('points_log_cause_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
            $table->foreign('points_log_cause_membership_id')->references('membership_id')->on('tbl_membership')->onDelete('cascade');
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
