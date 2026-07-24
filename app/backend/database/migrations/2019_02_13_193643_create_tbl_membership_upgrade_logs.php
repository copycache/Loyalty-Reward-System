<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblMembershipUpgradeLogs extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_membership_upgrade_logs', function (Blueprint $table)
        {
            $table->increments('membership_upgrade_log_id');
            $table->integer("slot_id")->unsigned()->nullable();
            $table->foreign('slot_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
            $table->integer("old_membership_id")->unsigned()->nullable();
            $table->foreign('old_membership_id')->references('membership_id')->on('tbl_membership')->onDelete('cascade');
            $table->integer("new_membership_id")->unsigned()->nullable();
            $table->foreign('new_membership_id')->references('membership_id')->on('tbl_membership')->onDelete('cascade');
            $table->datetime('upgraded_at');

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
