<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblSlotRelationship extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_slot', function (Blueprint $table) 
        {
            $table->foreign('slot_owner')->references('id')->on('users')->onDelete('cascade');

            // $table->integer('slot_membership')->unsigned()->nullable()->change();

            // $table->foreign('slot_membership')->references('membership_id')->on('tbl_membership')->onDelete('cascade');
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