<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblNewSlot extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable('tbl_slot')) 
        {    
            Schema::create('tbl_slot', function (Blueprint $table) 
            {
                $table->increments("slot_id");
                $table->string("slot_no")->default("");
                $table->integer("slot_owner")->unsigned();
                $table->integer("slot_membership")->unsigned();
                $table->integer("slot_placement")->unsigned()->default(0);
                $table->string("slot_position")->default("");
                $table->integer("slot_sponsor")->unsigned();
                $table->string("slot_type")->default("");
                $table->double("slot_left_points")->default(0);
                $table->double("slot_right_points")->default(0);
                $table->double("slot_wallet")->default(0);
                $table->double("slot_total_earnings")->default(0);
                $table->double("slot_total_payout")->default(0);
                $table->string("slot_pairs_per_day_date")->default("");
                $table->integer("slot_pairs_per_day")->default(0);
                $table->double("slot_personal_pv")->default(0);
                $table->double("slot_group_pv")->default(0);
                $table->double("slot_personal_spv")->default(0);
                $table->double("slot_group_spv")->default(0);
                $table->integer("slot_used_code")->unsigned()->default(0);
                $table->dateTime("slot_date_created");
                $table->tinyInteger("distributed")->default(0);
                $table->tinyInteger("archive")->default(0);
            });
        }

        if (!Schema::hasColumn('tbl_slot', 'slot_group_spv')) 
        {
            Schema::table('tbl_slot', function (Blueprint $table) 
            {
                $table->double("slot_group_spv")->default(0);
            });
        }
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
