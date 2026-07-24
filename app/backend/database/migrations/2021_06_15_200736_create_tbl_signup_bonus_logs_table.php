<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblSignupBonusLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_signup_bonus_logs', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('slot_id')->unsigned();
            $table->integer('sponsor_id')->unsigned();
            $table->integer('membership_id')->unsigned();
            $table->string('date')->nullable();
            
            
            $table->foreign('slot_id')
            ->references('slot_id')->on('tbl_slot')
            ->onDelete('cascade');
            $table->foreign('sponsor_id')
            ->references('slot_id')->on('tbl_slot')
            ->onDelete('cascade');
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
        Schema::dropIfExists('tbl_signup_bonus_logs');
    }
}
