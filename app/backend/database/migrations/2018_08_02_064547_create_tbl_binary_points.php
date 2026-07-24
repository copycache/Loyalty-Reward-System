<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblBinaryPoints extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_binary_points', function (Blueprint $table) 
        {
            $table->increments('binary_points_id');
            $table->integer('binary_points_slot_id')->unsigned();
            $table->double('binary_receive_left')->default(0);
            $table->double('binary_receive_right')->default(0);
            $table->double('binary_old_left')->default(0);
            $table->double('binary_old_right')->default(0);
            $table->double('binary_new_left')->default(0);
            $table->double('binary_new_right')->default(0);
            $table->double('binary_points_income')->default(0);
            $table->double('binary_points_flushout')->default(0);
            $table->string('binary_points_trigger')->default("");
            $table->integer('binary_cause_slot_id')->unsigned()->nullable();
            $table->integer('binary_cause_membership_id')->unsigned()->nullable();
            $table->integer('binary_cause_level')->default(0);
            $table->dateTime('binary_points_date_received');

            $table->foreign('binary_cause_slot_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
            $table->foreign('binary_points_slot_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
            $table->foreign('binary_cause_membership_id')->references('membership_id')->on('tbl_membership')->onDelete('cascade');
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
