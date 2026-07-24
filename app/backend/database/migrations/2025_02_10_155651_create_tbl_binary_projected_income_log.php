<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblBinaryProjectedIncomeLog extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_binary_projected_income_log', function (Blueprint $table) {
            $table->increments('log_id');
            $table->integer('slot_id')->unsigned();
            $table->integer('membership_id')->unsigned()->nullable();
            $table->integer('cause_slot_id')->unsigned();
            $table->integer('cause_membership_id')->unsigned()->nullable();
            $table->integer('cause_level')->default(0);
            $table->double("wallet_amount")->default(0);
            $table->integer("status")->default(0);
            $table->string('date_status_change')->nullable();
            $table->string('date_created')->nullable();
            
            $table->foreign('slot_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
            $table->foreign('membership_id')->references('membership_id')->on('tbl_membership')->onDelete('cascade');
            $table->foreign('cause_slot_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
            $table->foreign('cause_membership_id')->references('membership_id')->on('tbl_membership')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_binary_projected_income_log');
    }
}
